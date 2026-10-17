'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';
import {
    getDailyLogRef,
    toggleHabitCompletion,
    updateDailyHabitProgress,
    setDailyHabitOutcome,
    fetchHistoricalLogs,
} from '@/lib/firebase/firestore';
import { getTodayString, getDayOfWeek } from '@/utils/date-helpers';
import { isHabitRequiredOnDay } from '@/utils/analytics-helpers';

/**
 * Hook for managing daily logs — binary toggles, granular progress updates,
 * and completion statistics that respect planned rest days.
 * 
 * @param {import('firebase/auth').User | null} user
 * @param {Array} todaysHabits - Today's filtered habits (from useHabits)
 * @returns {Object} Daily log state and actions
 */
export function useDailyLogs(user, todaysHabits = []) {
    const [dailyLogs, setDailyLogs] = useState({});
    const [todayLog, setTodayLog] = useState([]);
    const [todayProgress, setTodayProgress] = useState({});

    const today = getTodayString();
    const currentDow = getDayOfWeek();

    // Real-time listener for today's daily log
    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setTodayLog([]);
                setTodayProgress({});
            });
            return;
        }

        const dailyLogRef = getDailyLogRef(user.uid, today);

        const unsubscribe = onSnapshot(dailyLogRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const completedIds = data.completedHabitIds || [];
                const habitProgress = data.habitProgress || {};
                const habitOutcomes = { ...(data.habitOutcomes || {}) };
                for (const [key, val] of Object.entries(data)) {
                    if (key.startsWith('habitOutcomes.')) {
                        const id = key.slice('habitOutcomes.'.length);
                        if (val && typeof val === 'object' && !habitOutcomes[id]) {
                            habitOutcomes[id] = val;
                        }
                    }
                }
                setTodayLog(completedIds);
                setTodayProgress({
                    ...habitProgress,
                    outcomes: habitOutcomes,
                });
                setDailyLogs(prev => ({
                    ...prev,
                    [today]: {
                        completedHabitIds: completedIds,
                        habitProgress,
                        habitOutcomes,
                    },
                }));
            } else {
                setTodayLog([]);
                setTodayProgress({});
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

        // Optimistic update using functional state updater
        setTodayLog(prev => isCompleted
            ? prev.filter(id => id !== habitId)
            : [...prev, habitId]
        );

        try {
            await toggleHabitCompletion(user.uid, today, habitId, isCompleted);
        } catch (err) {
            console.error('Error toggling habit:', err);
            // Revert only this specific habit to avoid stomping concurrent updates
            setTodayLog(prev => isCompleted
                ? [...prev, habitId]
                : prev.filter(id => id !== habitId)
            );
        }
    }, [user, today, todayLog]);

    // Update granular progress (workbook sessions, review status, exercise checklists, reading, diary)
    const updateProgress = useCallback(async (habitId, progressData, isFullyCompleted) => {
        if (!user) return;

        // Optimistic update
        setTodayProgress(prev => ({
            ...prev,
            [habitId]: {
                ...(prev[habitId] || {}),
                ...progressData,
            },
        }));

        if (typeof isFullyCompleted === 'boolean') {
            setTodayLog(prev => {
                if (isFullyCompleted && !prev.includes(habitId)) {
                    return [...prev, habitId];
                }
                if (!isFullyCompleted && prev.includes(habitId)) {
                    return prev.filter(id => id !== habitId);
                }
                return prev;
            });
        }

        try {
            await updateDailyHabitProgress(user.uid, today, habitId, progressData, isFullyCompleted);
        } catch (err) {
            console.error('Error updating habit progress:', err);
        }
    }, [user, today]);

    // Record an explicit outcome (completed, skipped, missed, or null to clear)
    const setHabitOutcome = useCallback(async (habitId, outcomeStatus, reason = null) => {
        if (!user) return;

        // Optimistic update
        setTodayProgress(prev => {
            const nextOutcomes = { ...(prev.outcomes || {}) };
            if (outcomeStatus) {
                nextOutcomes[habitId] = { status: outcomeStatus, reason, recordedAt: new Date().toISOString() };
            } else {
                delete nextOutcomes[habitId];
            }
            return {
                ...prev,
                outcomes: nextOutcomes,
            };
        });

        // Also update local dailyLogs map for today so analytics & streaks reflect instantly
        setDailyLogs(prev => {
            const currentDayLog = prev[today] || { completedHabitIds: [], habitProgress: {}, habitOutcomes: {} };
            const nextOutcomes = { ...(currentDayLog.habitOutcomes || {}) };
            if (outcomeStatus) {
                nextOutcomes[habitId] = { status: outcomeStatus, reason, recordedAt: new Date().toISOString() };
            } else {
                delete nextOutcomes[habitId];
            }
            const nextCompleted = outcomeStatus === 'completed'
                ? (currentDayLog.completedHabitIds?.includes(habitId) ? currentDayLog.completedHabitIds : [...(currentDayLog.completedHabitIds || []), habitId])
                : (currentDayLog.completedHabitIds || []).filter(id => id !== habitId);

            return {
                ...prev,
                [today]: {
                    ...currentDayLog,
                    completedHabitIds: nextCompleted,
                    habitOutcomes: nextOutcomes,
                },
            };
        });

        if (outcomeStatus === 'completed') {
            setTodayLog(prev => prev.includes(habitId) ? prev : [...prev, habitId]);
        } else {
            setTodayLog(prev => prev.filter(id => id !== habitId));
        }

        try {
            await setDailyHabitOutcome(user.uid, today, habitId, outcomeStatus, reason);
        } catch (err) {
            console.error('Error setting habit outcome:', err);
        }
    }, [user, today]);

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

    // Today's completion stats:
    // Exclude planned rest days from denominator using centralized isHabitRequiredOnDay
    const todayStats = useMemo(() => {
        const activeRequiredHabits = todaysHabits.filter(h => isHabitRequiredOnDay(h, currentDow));

        const total = activeRequiredHabits.length;
        const completed = activeRequiredHabits.filter(h => todayLog.includes(h.id)).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;

        return {
            total,
            completed,
            percentage,
            isSunday: currentDow === 'Sun',
        };
    }, [todaysHabits, currentDow, todayLog]);

    return {
        dailyLogs,
        todayLog,
        todayProgress,
        todayStats,
        toggleHabit,
        updateProgress,
        setHabitOutcome,
        fetchDailyLogs,
    };
}
