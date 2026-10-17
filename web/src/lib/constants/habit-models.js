/**
 * Canonical Composable Habit & Daily Log Models, Validators, and Date Helpers.
 * Phase 1: Universal Domain & Database Foundation
 * 
 * Defines:
 * - Composable Habit Model & feature slot schemas
 * - Daily Log Model with 3-layer outcome architecture (persisted vs normalized vs derived)
 * - Effective-dated Schedule History for historical preservation
 * - Deterministic Timezone and Observance Date resolution (04:00 AM grace window)
 * - Strict validation and habit-specific historical date provenance
 */

import { CATEGORIES } from './categories.js';

// ============================================================================
// Enums & Domain Constants
// ============================================================================

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TIMING_TYPES = ['anytime', 'preferred_period', 'relative', 'exact'];

export const PREFERRED_PERIODS = ['Morning', 'Afternoon', 'Evening', 'Night'];

/**
 * Strict enum for persisted habit outcomes in Firestore (/dailyLogs/{id}.habitOutcomes).
 * Persisted outcomes MUST ONLY represent explicit recorded actions.
 */
export const PERSISTED_OUTCOME_STATUSES = ['completed', 'skipped', 'missed'];

/**
 * Full domain enum for resolved habit outcomes (including runtime/derived states).
 */
export const DOMAIN_OUTCOME_STATUSES = ['completed', 'skipped', 'missed', 'unrecorded'];

/**
 * 4-tier habit-specific historical date provenance classifications.
 */
export const PROVENANCE_STATUSES = [
  'verified_creation',   // Tier 1: Authoritative createdAt, no logs precede it
  'verified_first_log',  // Tier 2: Habit-specific log precedes createdAt (re-seeded)
  'inferred_activity',   // Tier 3: Lacks createdAt, anchored to earliest habit log
  'unverifiable',        // Tier 4: Lacks createdAt and zero habit logs (horizon is null)
];

export const SEED_ORIGINS = [
  'custom',
  'template',
  'personal_preset',
  'foundation_preset',
];

// ============================================================================
// Domain Errors
// ============================================================================

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ============================================================================
// Date & Timezone Pure Helpers
// ============================================================================

/**
 * Deterministically resolve the logical observance date ('YYYY-MM-DD') for an event.
 * 
 * Observance Window Rule:
 * - Observance day opens at 00:00 local time.
 * - The grace period extends until 04:00:00 AM local time the next morning.
 * - Any event between 00:00 and 03:59:59 AM local time is deterministically attributed
 *   to the PREVIOUS calendar day in the user's anchor timezone.
 * 
 * @param {number|Date|string} timestamp - UTC epoch ms, Date instance, or ISO string
 * @param {string} timezone - Valid IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York')
 * @returns {string} Logical observance date string 'YYYY-MM-DD'
 */
export function resolveObservanceDate(timestamp, timezone = 'UTC') {
  if (!timestamp) {
    throw new ValidationError('Timestamp is required to resolve observance date.');
  }

  const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(`Invalid timestamp provided: ${timestamp}`);
  }

  const safeTz = isValidTimezone(timezone) ? timezone : 'UTC';

  // Extract wall-clock components in user's anchor timezone
  const parts = getZonedDateParts(dateObj, safeTz);

  // If local hour is before 04:00 AM, the event belongs to previous calendar day's grace window
  if (parts.hour < 4) {
    return subtractOneCalendarDay(parts.year, parts.month, parts.day);
  }

  return formatYearMonthDay(parts.year, parts.month, parts.day);
}

/**
 * Convert a habit creation timestamp to a local calendar date ('YYYY-MM-DD')
 * formatted in the user's anchor timezone.
 * 
 * Strictly avoids blindly slicing UTC ISO strings (toISOString().slice(0, 10)),
 * which causes artificial 1-day date shifts across UTC boundaries.
 * 
 * @param {Object|number|Date|string|null} createdAtTimestamp - Firestore Timestamp, Date, ms, or ISO string
 * @param {string} timezone - Valid IANA timezone identifier
 * @returns {string|null} 'YYYY-MM-DD' or null if timestamp is null/undefined
 */
export function convertTimestampToTrackingDate(createdAtTimestamp, timezone = 'UTC') {
  if (!createdAtTimestamp) return null;

  let dateObj;
  if (typeof createdAtTimestamp.toDate === 'function') {
    dateObj = createdAtTimestamp.toDate();
  } else if (createdAtTimestamp instanceof Date) {
    dateObj = createdAtTimestamp;
  } else if (typeof createdAtTimestamp === 'object' && '_seconds' in createdAtTimestamp) {
    dateObj = new Date(createdAtTimestamp._seconds * 1000);
  } else {
    dateObj = new Date(createdAtTimestamp);
  }

  if (isNaN(dateObj.getTime())) return null;

  const safeTz = isValidTimezone(timezone) ? timezone : 'UTC';
  const parts = getZonedDateParts(dateObj, safeTz);
  return formatYearMonthDay(parts.year, parts.month, parts.day);
}

/**
 * Validate whether a timezone string is recognized by Intl.
 * @param {string} tz 
 * @returns {boolean}
 */
export function isValidTimezone(tz) {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function getZonedDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  for (const p of parts) {
    if (p.type !== 'literal') {
      partMap[p.type] = p.value;
    }
  }

  return {
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    hour: parseInt(partMap.hour, 10),
    minute: parseInt(partMap.minute, 10),
    second: parseInt(partMap.second, 10),
  };
}

function formatYearMonthDay(year, month, day) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function subtractOneCalendarDay(year, month, day) {
  // Calendar arithmetic using UTC Date container to avoid daylight saving hour skew
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
}

// ============================================================================
// Effective-Dated Schedule History
// ============================================================================

/**
 * Create a new schedule history entry.
 * @param {Object} schedule - Schedule object
 * @param {string} effectiveDate - 'YYYY-MM-DD' when this schedule takes effect
 * @returns {Object} Canonical ScheduleHistoryEntry
 */
export function createScheduleHistoryEntry(schedule, effectiveDate) {
  if (!effectiveDate || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
    throw new ValidationError(`Valid effectiveDate ('YYYY-MM-DD') required for schedule history, received: ${effectiveDate}`);
  }

  const frequency = Array.isArray(schedule.frequency) ? [...schedule.frequency] : [...WEEKDAYS];
  const restDays = Array.isArray(schedule.restDays) ? [...schedule.restDays] : [];

  return {
    effectiveDate,
    frequency,
    restDays,
    timingType: schedule.timingType || 'anytime',
    preferredPeriod: schedule.preferredPeriod || null,
    relativeTiming: schedule.relativeTiming || null,
    exactTime: schedule.exactTime || null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Retrieve the effective schedule for a habit on a specific calendar date.
 * 
 * Evaluates `scheduleHistory` entries where `effectiveDate <= targetDate`,
 * returning the latest applicable entry. If no matching history entry exists,
 * returns the habit's canonical `schedule`.
 * 
 * Demonstrates that schedule edits do not retroactively rewrite historical expectations.
 * 
 * @param {Object} habit - ComposableHabitModel
 * @param {string} targetDate - 'YYYY-MM-DD'
 * @returns {Object} Effective schedule object active on targetDate
 */
export function getEffectiveScheduleForDate(habit, targetDate) {
  if (!habit || !habit.schedule) {
    throw new ValidationError('Habit with schedule required to resolve effective schedule.');
  }

  const history = Array.isArray(habit.scheduleHistory) ? habit.scheduleHistory : [];

  if (history.length > 0 && targetDate) {
    // Sort ascending by effectiveDate
    const sorted = [...history].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    
    // Find the latest entry that took effect on or before targetDate
    let matchingEntry = null;
    for (const entry of sorted) {
      if (entry.effectiveDate <= targetDate) {
        matchingEntry = entry;
      } else {
        break;
      }
    }

    if (matchingEntry) {
      return {
        frequency: [...matchingEntry.frequency],
        restDays: [...(matchingEntry.restDays || [])],
        timingType: matchingEntry.timingType || 'anytime',
        preferredPeriod: matchingEntry.preferredPeriod || null,
        relativeTiming: matchingEntry.relativeTiming || null,
        exactTime: matchingEntry.exactTime || null,
        source: 'schedule_history',
        effectiveDate: matchingEntry.effectiveDate,
      };
    }
  }

  // Fallback to current schedule
  return {
    frequency: [...habit.schedule.frequency],
    restDays: [...(habit.schedule.restDays || [])],
    timingType: habit.schedule.timingType || 'anytime',
    preferredPeriod: habit.schedule.preferredPeriod || null,
    relativeTiming: habit.schedule.relativeTiming || null,
    exactTime: habit.schedule.exactTime || null,
    source: 'current_schedule',
    effectiveDate: habit.lifecycle?.trackingHorizon?.startDate || null,
  };
}

/**
 * Apply a schedule update to a habit while preserving historical schedule continuity.
 * 
 * If scheduleHistory was empty, the prior schedule is preserved as an entry effective
 * from the habit's tracking horizon start date (or createdAt). The new schedule is
 * recorded as an entry effective on `effectiveDate`.
 * 
 * @param {Object} habit - ComposableHabitModel
 * @param {Object} newSchedule - New schedule configuration
 * @param {string} effectiveDate - 'YYYY-MM-DD' when the change takes effect
 * @returns {Object} New habit object with updated schedule and scheduleHistory
 */
export function applyScheduleUpdate(habit, newSchedule, effectiveDate) {
  if (!habit) throw new ValidationError('Habit required to apply schedule update.');
  if (!effectiveDate || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
    throw new ValidationError(`Valid effectiveDate ('YYYY-MM-DD') required, received: ${effectiveDate}`);
  }

  const existingHistory = Array.isArray(habit.scheduleHistory) ? [...habit.scheduleHistory] : [];
  const trackingStart = habit.lifecycle?.trackingHorizon?.startDate || '1970-01-01';

  // If history was empty, record the baseline schedule effective from tracking start
  if (existingHistory.length === 0 && habit.schedule) {
    existingHistory.push(createScheduleHistoryEntry(habit.schedule, trackingStart));
  }

  // Check if an entry for this exact effectiveDate already exists
  const existingIndex = existingHistory.findIndex(e => e.effectiveDate === effectiveDate);
  const newEntry = createScheduleHistoryEntry(newSchedule, effectiveDate);

  if (existingIndex >= 0) {
    existingHistory[existingIndex] = newEntry;
  } else {
    existingHistory.push(newEntry);
  }

  // Keep history sorted ascending by effectiveDate
  existingHistory.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

  return {
    ...habit,
    schedule: {
      ...habit.schedule,
      ...newSchedule,
      frequency: [...(newSchedule.frequency || habit.schedule.frequency)],
      restDays: [...(newSchedule.restDays || habit.schedule.restDays || [])],
    },
    scheduleHistory: existingHistory,
    lifecycle: {
      ...habit.lifecycle,
      updatedAt: new Date().toISOString(),
    },
  };
}

// ============================================================================
// Historical Provenance Policy Engine
// ============================================================================

/**
 * Derive the tracking horizon for a habit based on habit-specific evidence.
 * 
 * Strictly follows the 4-tier policy:
 * - Tier 1 ('verified_creation'): Habit has createdAt, and NO habit-specific log precedes it.
 * - Tier 2 ('verified_first_log'): A verified habit-specific log precedes createdAt.
 * - Tier 3 ('inferred_activity'): Habit lacks createdAt, but habit logs exist.
 * - Tier 4 ('unverifiable'): Lacks createdAt and has zero habit logs -> startDate = null.
 * 
 * Strictly prohibits fallback to user.createdAt or logs belonging to other habits.
 * 
 * @param {Object} habitData - Habit document data
 * @param {Array<Object>} [habitSpecificLogs=[]] - Array of logs that explicitly reference THIS habit
 * @param {string} [timezone='UTC'] - User anchor timezone
 * @returns {Object} TrackingHorizon { startDate: string|null, status: string, inferredEvidence?: string }
 */
export function deriveTrackingHorizon(habitData, habitSpecificLogs = [], timezone = 'UTC') {
  const habitId = habitData?.id;
  const createdAt = habitData?.createdAt;
  const localCreationDate = convertTimestampToTrackingDate(createdAt, timezone);

  // Filter logs strictly referencing THIS specific habit
  const relevantLogDates = [];
  if (Array.isArray(habitSpecificLogs)) {
    for (const log of habitSpecificLogs) {
      if (!log || !log.date) continue;
      const hasCompleted = Array.isArray(log.completedHabitIds) && habitId && log.completedHabitIds.includes(habitId);
      const hasProgress = log.habitProgress && habitId && Boolean(log.habitProgress[habitId]);
      const hasOutcome = log.habitOutcomes && habitId && Boolean(log.habitOutcomes[habitId]);

      if (hasCompleted || hasProgress || hasOutcome) {
        relevantLogDates.push(log.date);
      }
    }
  }

  relevantLogDates.sort(); // Ascending YYYY-MM-DD
  const earliestLogDate = relevantLogDates.length > 0 ? relevantLogDates[0] : null;

  // Case 1: Habit has authoritative creation timestamp
  if (localCreationDate) {
    if (earliestLogDate && earliestLogDate < localCreationDate) {
      return {
        startDate: earliestLogDate,
        status: 'verified_first_log',
        inferredEvidence: `First verified activity on ${earliestLogDate} precedes recorded creation date ${localCreationDate} (re-seeded routine).`,
      };
    }

    return {
      startDate: localCreationDate,
      status: 'verified_creation',
    };
  }

  // Case 2: Habit lacks creation timestamp, but has habit-specific logs
  if (earliestLogDate) {
    return {
      startDate: earliestLogDate,
      status: 'inferred_activity',
      inferredEvidence: `Creation timestamp missing; tracking horizon anchored to earliest recorded activity on ${earliestLogDate}.`,
    };
  }

  // Case 3: Lacks creation timestamp AND zero habit-specific activity records
  return {
    startDate: null,
    status: 'unverifiable',
    inferredEvidence: 'No habit-specific creation timestamp or historical activity records found.',
  };
}

// ============================================================================
// Model Validation
// ============================================================================

/**
 * Validate a ComposableHabitModel instance.
 * @param {Object} habit 
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateComposableHabit(habit) {
  const errors = [];

  if (!habit || typeof habit !== 'object') {
    return { valid: false, errors: ['Habit must be a valid object.'] };
  }

  if (!habit.id || typeof habit.id !== 'string') errors.push('Habit id is required.');
  if (!habit.userId || typeof habit.userId !== 'string') errors.push('Habit userId is required.');
  
  if (!habit.title || typeof habit.title !== 'string' || habit.title.trim().length === 0) {
    errors.push('Habit title must be a non-empty string.');
  } else if (habit.title.length > 200) {
    errors.push('Habit title cannot exceed 200 characters.');
  }

  if (!habit.category || !CATEGORIES.includes(habit.category)) {
    errors.push(`Habit category '${habit.category}' is invalid. Allowed: ${CATEGORIES.join(', ')}`);
  }

  // Schedule validation
  if (!habit.schedule || typeof habit.schedule !== 'object') {
    errors.push('Habit schedule is required.');
  } else {
    if (!Array.isArray(habit.schedule.frequency) || habit.schedule.frequency.length === 0) {
      errors.push('Schedule frequency must contain at least one weekday.');
    } else {
      const invalidDays = habit.schedule.frequency.filter(d => !WEEKDAYS.includes(d));
      if (invalidDays.length > 0) {
        errors.push(`Invalid frequency days: ${invalidDays.join(', ')}`);
      }
    }

    if (habit.schedule.timingType && !TIMING_TYPES.includes(habit.schedule.timingType)) {
      errors.push(`Invalid timingType: '${habit.schedule.timingType}'. Allowed: ${TIMING_TYPES.join(', ')}`);
    }

    if (habit.schedule.restDays) {
      if (!Array.isArray(habit.schedule.restDays)) {
        errors.push('Schedule restDays must be an array.');
      } else {
        const invalidRest = habit.schedule.restDays.filter(d => !WEEKDAYS.includes(d));
        if (invalidRest.length > 0) {
          errors.push(`Invalid rest days: ${invalidRest.join(', ')}`);
        }
      }
    }
  }

  // Features validation
  if (habit.features && typeof habit.features === 'object') {
    const f = habit.features;
    if (f.counter && f.counter.enabled) {
      if (typeof f.counter.targetCount !== 'number' || f.counter.targetCount <= 0) {
        errors.push('Counter targetCount must be a positive number.');
      }
      if (!f.counter.unit || typeof f.counter.unit !== 'string') {
        errors.push('Counter unit must be a non-empty string.');
      }
    }

    if (f.timer && f.timer.enabled) {
      if (typeof f.timer.targetDurationMinutes !== 'number' || f.timer.targetDurationMinutes <= 0) {
        errors.push('Timer targetDurationMinutes must be a positive number.');
      }
    }

    if (f.checklist && f.checklist.enabled) {
      if (!Array.isArray(f.checklist.items)) {
        errors.push('Checklist items must be an array.');
      }
    }
  }

  // Lifecycle validation
  if (!habit.lifecycle || typeof habit.lifecycle !== 'object') {
    errors.push('Habit lifecycle object is required.');
  } else {
    const th = habit.lifecycle.trackingHorizon;
    if (!th || typeof th !== 'object') {
      errors.push('Lifecycle trackingHorizon is required.');
    } else {
      if (!PROVENANCE_STATUSES.includes(th.status)) {
        errors.push(`Invalid trackingHorizon status: '${th.status}'.`);
      }
      if (th.startDate !== null && (typeof th.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(th.startDate))) {
        errors.push(`trackingHorizon startDate must be 'YYYY-MM-DD' or null, received: ${th.startDate}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a PersistedDailyLogDoc instance before writing to Cloud Firestore.
 * 
 * Enforces the strict Layer 1 persisted schema invariant:
 * - habitOutcomes MUST ONLY contain statuses: 'completed' | 'skipped' | 'missed'
 * - 'unrecorded_outcome' or 'unrecorded' is STRICTLY FORBIDDEN from persistence
 * 
 * @param {Object} logDoc 
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateDailyLogDoc(logDoc) {
  const errors = [];

  if (!logDoc || typeof logDoc !== 'object') {
    return { valid: false, errors: ['Daily log must be an object.'] };
  }

  if (!logDoc.userId || typeof logDoc.userId !== 'string') {
    errors.push('Daily log userId is required.');
  }

  if (!logDoc.date || typeof logDoc.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(logDoc.date)) {
    errors.push(`Daily log date must be 'YYYY-MM-DD', received: ${logDoc.date}`);
  }

  if (logDoc.timezone && !isValidTimezone(logDoc.timezone)) {
    errors.push(`Invalid timezone on daily log: ${logDoc.timezone}`);
  }

  if (logDoc.habitOutcomes && typeof logDoc.habitOutcomes === 'object') {
    for (const [habitId, outcome] of Object.entries(logDoc.habitOutcomes)) {
      if (!outcome || typeof outcome !== 'object') {
        errors.push(`Outcome for habit '${habitId}' must be an object.`);
        continue;
      }
      if (!PERSISTED_OUTCOME_STATUSES.includes(outcome.status)) {
        errors.push(
          `Invalid persisted outcome status '${outcome.status}' for habit '${habitId}'. ` +
          `Persisted outcomes must only be one of: ${PERSISTED_OUTCOME_STATUSES.join(', ')}. ` +
          `'unrecorded' is a derived runtime state and must never be persisted.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
