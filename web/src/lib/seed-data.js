/**
 * Foundation Starter Routines for Vritta (Client-Safe).
 * High-utility, general wellness, focus, and reflection routines suitable for any user.
 * 
 * Contains zero proprietary personal book titles, exercise protocols, or private audio catalogs.
 */

const ALL_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WORKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const DEFAULT_ROUTINES = [
  // 1. Morning Hydration & Mindfulness
  {
    stableKey: 'routine_hydration_mindfulness',
    title: 'Morning Hydration & Mindfulness',
    category: 'Reflection',
    completionMethod: 'simple',
    timingType: 'preferred_period',
    preferredPeriod: 'Morning',
    time: 'Morning',
    frequency: [...ALL_WEEKDAYS],
    order: 1,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      targetGlassCount: 2,
      mindfulnessMinutes: 5,
    },
    instructions:
      'Begin your morning with a tall glass of fresh water and 5 minutes of quiet, centered breathing before engaging with digital screens or work.',
    checklistItems: [
      { label: 'Drink 1-2 glasses of water' },
      { label: '5 minutes of quiet breathing or gentle morning stretch' },
    ],
  },

  // 2. Daily Physical Movement
  {
    stableKey: 'routine_physical_movement',
    title: 'Daily Physical Movement',
    category: 'Movement & Strength',
    completionMethod: 'simple',
    timingType: 'preferred_period',
    preferredPeriod: 'Afternoon',
    time: 'Afternoon',
    frequency: [...ALL_WEEKDAYS],
    order: 2,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      targetDurationMinutes: 30,
    },
    instructions:
      'Dedicate 20 to 30 minutes to intentional movement: an outdoor walk, bodyweight mobility exercises, yoga, or functional conditioning.',
    checklistItems: [
      { label: 'Warm-up & joint mobility (3–5 min)' },
      { label: 'Main movement session (20–25 min)' },
      { label: 'Cool-down & gentle stretch' },
    ],
  },

  // 3. Deep Work & Focus Block
  {
    stableKey: 'routine_focus_block',
    title: 'Deep Work & Focus Block',
    category: 'Schedule',
    completionMethod: 'simple',
    timingType: 'preferred_period',
    preferredPeriod: 'Morning',
    time: 'Morning',
    frequency: [...WORKDAYS],
    order: 3,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      targetDurationMinutes: 60,
    },
    instructions:
      'Dedicate 45 to 90 minutes of distraction-free focus to your highest-priority creative, engineering, or study goal. Silence notifications.',
    checklistItems: [
      { label: 'Clear workspace and silence notifications' },
      { label: 'Complete uninterrupted deep work sprint' },
    ],
  },

  // 4. Balanced Nourishment & Hydration
  {
    stableKey: 'routine_balanced_nutrition',
    title: 'Balanced Nourishment & Hydration',
    category: 'Nutrition',
    completionMethod: 'checklist',
    timingType: 'anytime',
    preferredPeriod: null,
    time: 'Flexible',
    frequency: [...ALL_WEEKDAYS],
    order: 4,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      dailyWaterTargetLiters: 2.5,
    },
    instructions:
      'Support sustained energy and cognitive clarity with wholesome meals, regular water intake, and mindful eating habits.',
    checklistItems: [
      { label: 'Hydrate consistently throughout the day (2L+)' },
      { label: 'Eat balanced, whole-food meals without rushed snacking' },
    ],
  },

  // 5. Evening Digital Wind-Down
  {
    stableKey: 'routine_digital_winddown',
    title: 'Evening Digital Wind-Down',
    category: 'Recovery',
    completionMethod: 'simple',
    timingType: 'preferred_period',
    preferredPeriod: 'Evening',
    time: 'Evening',
    frequency: [...ALL_WEEKDAYS],
    order: 5,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      screenFreeMinutesBeforeBed: 45,
    },
    instructions:
      'Disconnect from high-stimulation work screens, email, and social feeds 45 minutes before bedtime to allow the nervous system to relax.',
    checklistItems: [
      { label: 'Put work devices away 45 minutes before sleep' },
      { label: 'Engage in a quiet, screen-free evening transition' },
    ],
  },

  // 6. Daily Reflection & Gratitude
  {
    stableKey: 'routine_daily_reflection',
    title: 'Daily Reflection & Gratitude',
    category: 'Reflection',
    completionMethod: 'diary_entry',
    timingType: 'preferred_period',
    preferredPeriod: 'Night',
    time: 'Night',
    frequency: [...ALL_WEEKDAYS],
    order: 6,
    isSystemSeed: true,
    seedOrigin: 'foundation_preset',
    metadata: {
      isPrivateDiary: true,
      reflectionPrompts: [
        'What went well today and why?',
        'What challenge did I navigate, and what did I learn?',
        'What is one thing I am genuinely grateful for today?',
      ],
    },
    instructions:
      'Jot down brief notes celebrating small wins, capturing insights, and noting gratitude to close out your day with peace of mind.',
    checklistItems: [],
  },
];
