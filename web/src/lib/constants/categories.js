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
    borderColor: 'border-l-teal-600 dark:border-l-teal-400',
    bgColor: 'bg-teal-50/70 dark:bg-teal-950/40',
    bgColorDone: 'bg-teal-100/60 dark:bg-teal-900/40',
    badgeClasses: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
    textColor: 'text-teal-700 dark:text-teal-400',
    dotColor: 'bg-teal-600 dark:bg-teal-400',
    iconName: 'BookOpen',
    description: 'Vocabulary acquisition, reading practice, and workbook study',
  },
  'Movement & Strength': {
    label: 'Movement & Strength',
    borderColor: 'border-l-teal-600 dark:border-l-teal-400',
    bgColor: 'bg-teal-50/70 dark:bg-teal-950/40',
    bgColorDone: 'bg-teal-100/60 dark:bg-teal-900/40',
    badgeClasses: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
    textColor: 'text-teal-700 dark:text-teal-400',
    dotColor: 'bg-teal-600 dark:bg-teal-400',
    iconName: 'Activity',
    description: 'Bodyweight conditioning, posture correction, and physical routines',
  },
  'Listening & Awareness': {
    label: 'Listening & Awareness',
    borderColor: 'border-l-amber-500 dark:border-l-amber-400',
    bgColor: 'bg-amber-50/70 dark:bg-amber-950/40',
    bgColorDone: 'bg-amber-100/60 dark:bg-amber-900/40',
    badgeClasses: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    textColor: 'text-amber-700 dark:text-amber-400',
    dotColor: 'bg-amber-500 dark:bg-amber-400',
    iconName: 'Headphones',
    description: 'Contemplative listening, awareness exercises, and audio exploration',
  },
  'Reading': {
    label: 'Reading',
    borderColor: 'border-l-emerald-500 dark:border-l-emerald-400',
    bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/40',
    bgColorDone: 'bg-emerald-100/60 dark:bg-emerald-900/40',
    badgeClasses: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    iconName: 'BookMarked',
    description: 'Focused reading, study sessions, and bedtime transition',
  },
  'Communication': {
    label: 'Communication',
    borderColor: 'border-l-sky-500 dark:border-l-sky-400',
    bgColor: 'bg-sky-50/70 dark:bg-sky-950/40',
    bgColorDone: 'bg-sky-100/60 dark:bg-sky-900/40',
    badgeClasses: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    textColor: 'text-sky-700 dark:text-sky-400',
    dotColor: 'bg-sky-500 dark:bg-sky-400',
    iconName: 'MessageSquare',
    description: 'Conversational practice, writing, and expressive clarity',
  },
  'Reflection': {
    label: 'Reflection',
    borderColor: 'border-l-rose-400 dark:border-l-rose-400',
    bgColor: 'bg-rose-50/70 dark:bg-rose-950/40',
    bgColorDone: 'bg-rose-100/60 dark:bg-rose-900/40',
    badgeClasses: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    textColor: 'text-rose-700 dark:text-rose-400',
    dotColor: 'bg-rose-400 dark:bg-rose-400',
    iconName: 'PenTool',
    description: 'Private journaling, learning notes, and daily introspection',
  },
  'Movement': {
    label: 'Movement',
    borderColor: 'border-l-teal-500 dark:border-l-teal-400',
    bgColor: 'bg-teal-50/70 dark:bg-teal-950/40',
    bgColorDone: 'bg-teal-100/60 dark:bg-teal-900/40',
    badgeClasses: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
    textColor: 'text-teal-700 dark:text-teal-400',
    dotColor: 'bg-teal-500 dark:bg-teal-400',
    iconName: 'Activity',
    description: 'General physical movement, daily walking, and mobility',
  },
  'Nutrition': {
    label: 'Nutrition',
    borderColor: 'border-l-green-500 dark:border-l-green-400',
    bgColor: 'bg-green-50/70 dark:bg-green-950/40',
    bgColorDone: 'bg-green-100/60 dark:bg-green-900/40',
    badgeClasses: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800/60',
    textColor: 'text-green-700 dark:text-green-400',
    dotColor: 'bg-green-500 dark:bg-green-400',
    iconName: 'Coffee',
    description: 'Hydration, balanced meals, and mindful eating habits',
  },
  'Recovery': {
    label: 'Recovery',
    borderColor: 'border-l-teal-600 dark:border-l-teal-400',
    bgColor: 'bg-teal-50/70 dark:bg-teal-950/40',
    bgColorDone: 'bg-teal-100/60 dark:bg-teal-900/40',
    badgeClasses: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-teal-600 dark:bg-teal-400',
    iconName: 'Moon',
    description: 'Rest, sleep hygiene, and evening wind-down',
  },
  'Schedule': {
    label: 'Schedule',
    borderColor: 'border-l-slate-400 dark:border-l-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    bgColorDone: 'bg-slate-100 dark:bg-slate-800',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-400 dark:bg-slate-600',
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
    borderColor: 'border-l-slate-400 dark:border-l-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    bgColorDone: 'bg-slate-100 dark:bg-slate-800',
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-400 dark:bg-slate-600',
    iconName: 'CheckCircle2',
    description: '',
  };
}
