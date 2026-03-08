'use client';

import { useMemo } from 'react';
import { getDaysAgo, getDateString, getDayOfWeek } from '@/utils/date-helpers';

/**
 * Hook for calculating the user's current streak.
 * Memoized to prevent recalculation on every render.
 *
 * A "successful day" requires >= 50% habit completion.
 * Today is skipped if not yet complete (grace period).
 *
 * @param {Array} habits - All user habits
 * @param {Object} dailyLogs - Map of dateStr -> completedHabitIds[]
 * @returns {number} Current streak count
 */
export function useStreak(habits, dailyLogs) {
    return useMemo(() => {
        if (!habits.length) return 0;

        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
            const checkDate = getDaysAgo(i);
            const dateStr = getDateString(checkDate);
            const dayOfWeekForDate = getDayOfWeek(checkDate);

            const activeHabits = habits.filter(h => h.frequency?.includes(dayOfWeekForDate));
            if (activeHabits.length === 0) continue;

            const completedCount = dailyLogs[dateStr]?.length || 0;
            const completionRate = completedCount / activeHabits.length;

            if (completionRate >= 0.5) {
                currentStreak++;
            } else if (i === 0) {
                continue; // Today not complete yet — give grace
            } else {
                break;
            }
        }
        return currentStreak;
    }, [habits, dailyLogs]);
}
