/**
 * Centralized category configuration for Vritta.
 * Supports the 6 canonical life-area categories defined in the product specification,
 * while safely preserving legacy categories for existing user data.
 */

export const CANONICAL_CATEGORIES = [
  'English Learning',
  'Movement & Strength',
  'Listening & Awareness',
  'Reading',
  'Communication',
  'Reflection',
];

export const LEGACY_CATEGORIES = [
  'Schedule',
  'Movement',
  'Nutrition',
  'Recovery',
];

export const ALL_CATEGORIES = [
  ...CANONICAL_CATEGORIES,
  ...LEGACY_CATEGORIES,
];

// Default export list for dropdowns and pickers
export const CATEGORIES = ALL_CATEGORIES;

export const CATEGORY_CONFIG = {
  // Canonical Categories
  'English Learning': {
    label: 'English Learning',
    borderColor: 'border-l-indigo-500',
    bgColor: 'bg-indigo-50/70',
    bgColorDone: 'bg-indigo-100/60',
    badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    textColor: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
    iconName: 'BookOpen',
    description: 'Vocabulary acquisition and workbook exercises',
  },
  'Movement & Strength': {
    label: 'Movement & Strength',
    borderColor: 'border-l-teal-500',
    bgColor: 'bg-teal-50/70',
    bgColorDone: 'bg-teal-100/60',
    badgeClasses: 'bg-teal-100 text-teal-800 border-teal-200',
    textColor: 'text-teal-700',
    dotColor: 'bg-teal-500',
    iconName: 'Activity',
    description: 'Bodyweight conditioning, posture correction, and active recovery',
  },
  'Listening & Awareness': {
    label: 'Listening & Awareness',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50/70',
    bgColorDone: 'bg-amber-100/60',
    badgeClasses: 'bg-amber-100 text-amber-800 border-amber-200',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    iconName: 'Headphones',
    description: 'Daily discourse listening and contemplative inquiry',
  },
  'Reading': {
    label: 'Reading',
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-emerald-50/70',
    bgColorDone: 'bg-emerald-100/60',
    badgeClasses: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    iconName: 'BookMarked',
    description: 'Bedtime reading for calm transition to sleep',
  },
  'Communication': {
    label: 'Communication',
    borderColor: 'border-l-sky-500',
    bgColor: 'bg-sky-50/70',
    bgColorDone: 'bg-sky-100/60',
    badgeClasses: 'bg-sky-100 text-sky-800 border-sky-200',
    textColor: 'text-sky-700',
    dotColor: 'bg-sky-500',
    iconName: 'MessageSquare',
    description: 'Spoken English practice and conversational confidence',
  },
  'Reflection': {
    label: 'Reflection',
    borderColor: 'border-l-rose-400',
    bgColor: 'bg-rose-50/70',
    bgColorDone: 'bg-rose-100/60',
    badgeClasses: 'bg-rose-100 text-rose-800 border-rose-200',
    textColor: 'text-rose-700',
    dotColor: 'bg-rose-400',
    iconName: 'PenTool',
    description: 'Private journaling, learning notes, and personal thoughts',
  },

  // Legacy Categories (preserved for backward compatibility)
  'Schedule': {
    label: 'Schedule (Legacy)',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    bgColorDone: 'bg-gray-100',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
    iconName: 'Clock',
    description: 'Legacy timing category',
  },
  'Movement': {
    label: 'Movement (Legacy)',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    bgColorDone: 'bg-blue-100',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    iconName: 'Activity',
    description: 'Legacy movement category',
  },
  'Nutrition': {
    label: 'Nutrition (Legacy)',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    bgColorDone: 'bg-green-100',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
    iconName: 'Coffee',
    description: 'Legacy nutrition category',
  },
  'Recovery': {
    label: 'Recovery (Legacy)',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-50',
    bgColorDone: 'bg-purple-100',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
    textColor: 'text-purple-700',
    dotColor: 'bg-purple-500',
    iconName: 'Moon',
    description: 'Legacy recovery category',
  },
};

/**
 * Get category config safely, falling back to English Learning or neutral styling.
 * @param {string} category
 * @returns {Object}
 */
export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || {
    label: category || 'General',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    bgColorDone: 'bg-gray-100',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
    iconName: 'CheckCircle2',
    description: '',
  };
}
