/**
 * Shared reading duration constants and legacy normalization helper.
 *
 * Note: User-facing duration configuration is solely exposed and controlled
 * via HabitModal.js. This utility provides the shared canonical defaults and
 * non-breaking normalization logic for reading routines across the application.
 */

export const READING_DURATION_PRESETS = [15, 20, 30, 45, 60];
export const DEFAULT_READING_DURATION = 30;

/**
 * Normalizes reading duration target from a habit record.
 *
 * Data Flow & Canonical Storage Strategy:
 * 1. Primary (Canonical): `habit.targetMinutes` (top-level integer field).
 * 2. Secondary (Legacy Fallback): `habit.metadata.targetMinutes` (used by older seed records).
 * 3. Safe Default: Returns DEFAULT_READING_DURATION (30) ONLY when neither field contains
 *    a valid positive number. It never overrides a valid saved value.
 *
 * @param {Object} [habit]
 * @returns {number} Target duration in minutes
 */
export function getReadingTargetMinutes(habit) {
  if (!habit || typeof habit !== 'object') {
    return DEFAULT_READING_DURATION;
  }
  const raw = habit.targetMinutes !== undefined && habit.targetMinutes !== null
    ? habit.targetMinutes
    : habit.metadata?.targetMinutes;

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : DEFAULT_READING_DURATION;
}
