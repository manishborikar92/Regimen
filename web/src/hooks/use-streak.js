'use client';

import { useMemo } from 'react';
import { calculateStreak } from '@/utils/analytics-helpers';

/**
 * Hook for calculating the user's current streak.
 * 
 * Rules:
 * - A successful day requires >= 50% completion of scheduled, non-rest activities.
 * - Today is given grace if the day is still in progress.
 * - Planned rest days (e.g. Sunday movement or explicit restDays) are excluded from the denominator.
 * - Supports both array and object structures for dailyLogs entries.
 * 
 * @param {Array} habits - All user habits
 * @param {Object} dailyLogs - Map of dateStr -> completedHabitIds[] or { completedHabitIds, habitProgress }
 * @returns {number} Current streak count
 */
export function useStreak(habits, dailyLogs) {
    return useMemo(() => {
        return calculateStreak(habits, dailyLogs);
    }, [habits, dailyLogs]);
}
