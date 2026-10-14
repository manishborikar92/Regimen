'use client';

import { useMemo } from 'react';
import { getDaysAgo, getDateString, getDayOfWeek } from '@/utils/date-helpers';

/**
 * Hook for calculating the user's current streak.
 * 
 * Rules:
 * - A successful day requires >= 50% completion of scheduled, non-rest activities.
 * - Today is given grace if the day is still in progress.
 * - Planned rest days (e.g. Sunday movement) are excluded from the denominator.
 * - Supports both array and object structures for dailyLogs entries.
 * 
 * @param {Array} habits - All user habits
 * @param {Object} dailyLogs - Map of dateStr -> completedHabitIds[] or { completedHabitIds, habitProgress }
 * @returns {number} Current streak count
 */
export function useStreak(habits, dailyLogs) {
    return useMemo(() => {
        if (!habits || habits.length === 0) return 0;

        let currentStreak = 0;

        for (let i = 0; i < 30; i++) {
            const checkDate = getDaysAgo(i);
            const dateStr = getDateString(checkDate);
            const dayOfWeekForDate = getDayOfWeek(checkDate);

            // Filter active habits for that day of the week
            const activeHabits = habits.filter(h => {
                if (!h.frequency || h.frequency.length === 0) return true;
                return h.frequency.includes(dayOfWeekForDate);
            });

            // Exclude planned rest days from streak denominator (e.g., Sunday rest)
            const requiredHabits = activeHabits.filter(h => {
                const isSundayRest = dayOfWeekForDate === 'Sun' &&
                    (h.completionMethod === 'exercise_plan' || h.category === 'Movement & Strength');
                return !isSundayRest;
            });

            if (requiredHabits.length === 0) continue; // Pure rest day doesn't break a streak

            const logEntry = dailyLogs[dateStr];
            const completedList = Array.isArray(logEntry)
                ? logEntry
                : (logEntry?.completedHabitIds || []);

            // Count completed required habits
            const completedCount = requiredHabits.filter(h => completedList.includes(h.id)).length;
            const completionRate = completedCount / requiredHabits.length;

            if (completionRate >= 0.5) {
                currentStreak++;
            } else if (i === 0) {
                // Today is still ongoing — grace period
                continue;
            } else {
                break;
            }
        }

        return currentStreak;
    }, [habits, dailyLogs]);
}
