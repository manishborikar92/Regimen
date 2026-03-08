/**
 * Centralized category configuration.
 * Single source of truth for all category-related styling and metadata.
 */

export const CATEGORIES = ['Schedule', 'Movement', 'Nutrition', 'Recovery'];

export const CATEGORY_CONFIG = {
    Schedule: {
        label: 'Schedule',
        borderColor: 'border-l-gray-400',
        bgColor: 'bg-gray-50',
        bgColorDone: 'bg-gray-100',
        badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
        textColor: 'text-gray-700',
    },
    Movement: {
        label: 'Movement',
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-blue-50',
        bgColorDone: 'bg-blue-100',
        badgeClasses: 'bg-blue-100 text-blue-700 border-blue-200',
        textColor: 'text-blue-700',
    },
    Nutrition: {
        label: 'Nutrition',
        borderColor: 'border-l-green-500',
        bgColor: 'bg-green-50',
        bgColorDone: 'bg-green-100',
        badgeClasses: 'bg-green-100 text-green-700 border-green-200',
        textColor: 'text-green-700',
    },
    Recovery: {
        label: 'Recovery',
        borderColor: 'border-l-purple-500',
        bgColor: 'bg-purple-50',
        bgColorDone: 'bg-purple-100',
        badgeClasses: 'bg-purple-100 text-purple-700 border-purple-200',
        textColor: 'text-purple-700',
    },
};

/**
 * Get the category config for a given category name.
 * Falls back to Schedule config if category is unknown.
 * @param {string} category
 * @returns {Object} Category config
 */
export function getCategoryConfig(category) {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Schedule;
}
