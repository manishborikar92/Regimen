'use client';

import { useEffect, useState, useCallback } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getDailyLogRef, toggleHabitCompletion, fetchHistoricalLogs } from '@/lib/firebase/firestore';
import { getTodayString } from '@/utils/date-helpers';

/**
 * Hook for managing daily logs — toggle completion, fetch history, today's stats.
 * @param {import('firebase/auth').User | null} user
 * @param {Array} todaysHabits - Today's filtered habits (from useHabits)
 * @returns {Object} Daily log state and actions
 */
export function useDailyLogs(user, todaysHabits) {
    const [dailyLogs, setDailyLogs] = useState({});
    const [todayLog, setTodayLog] = useState([]);

    const today = getTodayString();

    // Real-time listener for today's daily log
    useEffect(() => {
        if (!user) return;

        const dailyLogRef = getDailyLogRef(user.uid, today);

        const unsubscribe = onSnapshot(dailyLogRef, (docSnap) => {
            if (docSnap.exists()) {
                const completedIds = docSnap.data().completedHabitIds || [];
                setTodayLog(completedIds);
                setDailyLogs(prev => ({ ...prev, [today]: completedIds }));
            } else {
                setTodayLog([]);
            }
        }, (err) => {
            console.error('Error listening to daily log:', err);
        });

        return () => unsubscribe();
    }, [user, today]);

    // Toggle habit completion for today (with optimistic update)
    const toggleHabit = useCallback(async (habitId) => {
        if (!user) return;

        const isCompleted = todayLog.includes(habitId);

        // Optimistic update
        const newTodayLog = isCompleted
            ? todayLog.filter(id => id !== habitId)
            : [...todayLog, habitId];
        setTodayLog(newTodayLog);

        try {
            await toggleHabitCompletion(user.uid, today, habitId, isCompleted, todayLog.length);
        } catch (err) {
            console.error('Error toggling habit:', err);
            setTodayLog(todayLog); // Revert on failure
        }
    }, [user, today, todayLog]);

    // Fetch historical daily logs (for analytics)
    const fetchDailyLogs = useCallback(async () => {
        if (!user) return {};

        try {
            const logsMap = await fetchHistoricalLogs(user.uid);
            setDailyLogs(prev => ({ ...prev, ...logsMap }));
            return logsMap;
        } catch (err) {
            console.error('Error fetching daily logs:', err);
            return {};
        }
    }, [user]);

    // Today's completion stats
    const todayStats = (() => {
        const total = todaysHabits.length;
        const completed = todaysHabits.filter(h => todayLog.includes(h.id)).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    })();

    return {
        dailyLogs,
        todayLog,
        todayStats,
        toggleHabit,
        fetchDailyLogs,
    };
}
