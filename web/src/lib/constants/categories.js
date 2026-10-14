/**
 * Centralized Category Configuration for Vritta.
 * Single source of truth for all habit categories, styling tokens, and display labels.
 *
 * All supported category keys and form options derive directly from CATEGORY_CONFIG.
 * Aligns 1:1 with Cloud Firestore security rules (isValidCategory).
 */

export const CATEGORY_CONFIG = {
  'English Learning': {
    label: 'English Learning',
    borderColor: 'border-l-indigo-500',
    bgColor: 'bg-indigo-50/70',
    bgColorDone: 'bg-indigo-100/60',
    badgeClasses: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    textColor: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
    iconName: 'BookOpen',
    description: 'Vocabulary acquisition, reading practice, and workbook study',
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
    description: 'Bodyweight conditioning, posture correction, and physical routines',
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
    description: 'Contemplative listening, awareness exercises, and audio exploration',
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
    description: 'Focused reading, study sessions, and bedtime transition',
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
    description: 'Conversational practice, writing, and expressive clarity',
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
    description: 'Private journaling, learning notes, and daily introspection',
  },
  'Movement': {
    label: 'Movement',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    bgColorDone: 'bg-blue-100',
    badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    iconName: 'Activity',
    description: 'General physical movement, daily walking, and mobility',
  },
  'Nutrition': {
    label: 'Nutrition',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    bgColorDone: 'bg-green-100',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
    iconName: 'Coffee',
    description: 'Hydration, balanced meals, and mindful eating habits',
  },
  'Recovery': {
    label: 'Recovery',
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-50',
    bgColorDone: 'bg-purple-100',
    badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
    textColor: 'text-purple-700',
    dotColor: 'bg-purple-500',
    iconName: 'Moon',
    description: 'Rest, sleep hygiene, and evening wind-down',
  },
  'Schedule': {
    label: 'Schedule',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    bgColorDone: 'bg-gray-100',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-400',
    iconName: 'Clock',
    description: 'Daily planning, focus blocks, and time management',
  },
};

/**
 * Authoritative array of all supported category keys.
 * Derived directly from CATEGORY_CONFIG (single source of truth).
 */
export const CATEGORIES = Object.keys(CATEGORY_CONFIG);

/**
 * Retrieve styling and label configuration for a category with safe fallback.
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
