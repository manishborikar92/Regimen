/**
 * Canonical Seed Data & Routines for Vritta.
 * Strictly adheres to section 4 and section 6 of docs/regimen_project_brief.md.
 * 
 * Rules:
 * - Stable, deterministic keys for idempotent upserting.
 * - Distinct separation between category, timing, recurrence, completion method, and instructions.
 * - Preferred timing is guidance, never a deadline.
 * - No historical completions, past diary entries, or assumed exercise start dates are seeded.
 */

import { OSHO_LIBRARY, OSHO_GROUPS } from './fixtures/osho-library.js';
import {
  MOVEMENT_SCHEDULE,
  WORKOUT_EXERCISES,
  WALK_DAY_ROUTINE,
  PROGRESSION_PHASES,
  READINESS_CRITERIA,
  STOP_SIGNALS,
  GENERAL_HEALTH_NOTES,
} from './fixtures/exercise-plan.js';

export {
  OSHO_LIBRARY,
  OSHO_GROUPS,
  MOVEMENT_SCHEDULE,
  WORKOUT_EXERCISES,
  WALK_DAY_ROUTINE,
  PROGRESSION_PHASES,
  READINESS_CRITERIA,
  STOP_SIGNALS,
  GENERAL_HEALTH_NOTES,
};

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CANONICAL_ROUTINES = [
  // 1. Practice English Workbook
  {
    stableKey: 'canonical_english_workbook',
    title: 'Practice English Workbook',
    category: 'English Learning',
    completionMethod: 'workbook_sessions',
    timingType: 'anytime',
    preferredPeriod: null,
    relativeTiming: null,
    time: 'Flexible',
    frequency: [...ALL_WEEKDAYS],
    order: 1,
    isSystemSeed: true,
    metadata: {
      bookTitle: 'Word Power Made Easy',
      bookAuthor: 'Norman Lewis',
      dailySessionsTarget: 2,
      reviewRequired: true,
      uninterruptedCheckRequired: true,
    },
    instructions:
      'Daily vocabulary-building with Word Power Made Easy by Norman Lewis to strengthen English vocabulary and build confident speaking, writing, and reading.\n\nRequired steps:\n1. Review and revise the previous day\'s work before beginning new work (if previous work exists).\n2. Complete Session 1.\n3. Complete Session 2.\n4. Note whether at least one session was completed without interruption.',
    checklistItems: [
      { label: 'Review previous day\'s workbook notes' },
      { label: 'Session 1 completed' },
      { label: 'Session 2 completed' },
      { label: 'At least one session completed uninterrupted' },
    ],
  },

  // 2. Exercise / Movement Plan
  {
    stableKey: 'canonical_exercise_plan',
    title: 'Exercise / Movement Plan',
    category: 'Movement & Strength',
    completionMethod: 'exercise_plan',
    timingType: 'preferred_period',
    preferredPeriod: 'Afternoon',
    relativeTiming: null,
    time: 'Afternoon',
    frequency: [...ALL_WEEKDAYS],
    order: 2,
    isSystemSeed: true,
    metadata: {
      is12WeekPlan: true,
      hasPlannedRestDays: true,
      restDays: ['Sun'],
      workoutDays: ['Mon', 'Wed', 'Fri'],
      walkDays: ['Tue', 'Thu', 'Sat'],
      targetDurationMinutes: 30,
    },
    instructions:
      'A 12-week progressive movement plan for posture, mobility, basic functional strength, and overall well-being at home with no equipment.\n\nSchedule:\n• Mon, Wed, Fri: Strength and Posture Workout (~30 min)\n• Tue, Thu, Sat: Easy Walk (10–20 min) and 3 Stretches\n• Sun: Planned Rest & Recovery (no workout required)\n\nPreferred timing is Afternoon. Completing your movement at any point today counts fully.',
    checklistItems: [],
  },

  // 3. Listen to Osho
  {
    stableKey: 'canonical_listen_osho',
    title: 'Listen to Osho',
    category: 'Listening & Awareness',
    completionMethod: 'osho_listening',
    timingType: 'anytime',
    preferredPeriod: null,
    relativeTiming: null,
    time: 'Flexible',
    frequency: [...ALL_WEEKDAYS],
    order: 3,
    isSystemSeed: true,
    metadata: {
      hasLibrary: true,
      libraryCount: 30,
      libraryGroups: 6,
    },
    instructions:
      'Listen to an Osho discourse daily for awareness, meditation, and thoughtful inquiry. Explore the 30-entry listening library across 6 thematic groups (Hindi series 1–23, English series 24–30) at your own pace.',
    checklistItems: [],
  },

  // 4. Read Books
  {
    stableKey: 'canonical_read_books',
    title: 'Read Books',
    category: 'Reading',
    completionMethod: 'reading_duration',
    timingType: 'relative',
    preferredPeriod: null,
    relativeTiming: 'Before bed',
    time: 'Before bed',
    frequency: [...ALL_WEEKDAYS],
    order: 4,
    isSystemSeed: true,
    metadata: {
      targetMinutes: 30,
      context: 'Before going to sleep',
    },
    instructions:
      'Read a book for 30 minutes before going to sleep. Relative timing: Before bed (no rigid clock time). Helps unwind and settle the mind.',
    checklistItems: [],
  },

  // 5. Practice English Speaking
  {
    stableKey: 'canonical_english_speaking',
    title: 'Practice English Speaking',
    category: 'Communication',
    completionMethod: 'simple_with_notes',
    timingType: 'anytime',
    preferredPeriod: null,
    relativeTiming: null,
    time: 'Flexible',
    frequency: [...ALL_WEEKDAYS],
    order: 5,
    isSystemSeed: true,
    metadata: {
      tool: 'ChatGPT Voice / Conversation',
    },
    instructions:
      'Practise speaking English with ChatGPT. Practice conversational fluency, pronunciation, and confident expression at any time during the day.',
    checklistItems: [],
  },

  // 6. Maintain a Diary
  {
    stableKey: 'canonical_maintain_diary',
    title: 'Maintain a Diary',
    category: 'Reflection',
    completionMethod: 'diary_entry',
    timingType: 'anytime',
    preferredPeriod: null,
    relativeTiming: null,
    time: 'Flexible',
    frequency: [...ALL_WEEKDAYS],
    order: 6,
    isSystemSeed: true,
    metadata: {
      isPrivateJournal: true,
      reflectivePrompts: [
        'What happened or what thought came to mind?',
        'What did I feel?',
        'What assumption might I be making?',
        'What did I learn?',
        'Is there a small next step?',
      ],
    },
    instructions:
      'Write in your personal diary about what you learned and your personal thoughts. Private to your account. Optional reflection prompts are provided in the journal view.',
    checklistItems: [],
  },
];

// Alias for default export / legacy consumers
export const seedHabits = CANONICAL_ROUTINES;
