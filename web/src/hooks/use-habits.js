'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { getHabitsQuery, createHabit, updateHabitDoc, deleteHabitDoc, seedHabitsForUser } from '@/lib/firebase/firestore';
import { getTodayString, getDayOfWeek } from '@/utils/date-helpers';

/**
 * Hook for managing habits — CRUD operations and real-time sync.
 * @param {import('firebase/auth').User | null} user
 * @returns {Object} Habits state and mutation functions
 */
export function useHabits(user) {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isInitialMount = useRef(true);

    const dayOfWeek = getDayOfWeek();

    // Real-time listener for user's habits
    useEffect(() => {
        if (!user) {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                Promise.resolve().then(() => setLoading(false));
            }
            return;
        }

        isInitialMount.current = false;
        const habitsQuery = getHabitsQuery(user.uid);

        const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
            const habitsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            habitsData.sort((a, b) => a.order - b.order);
            setHabits(habitsData);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching habits:', err);
            setError('Failed to load habits');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Today's habits filtered by day of week
    const todaysHabits = habits.filter(habit => habit.frequency?.includes(dayOfWeek));

    // Add a new habit
    const addHabit = useCallback(async (habitData) => {
        if (!user) return;
        return createHabit(user.uid, habitData);
    }, [user]);

    // Update an existing habit
    const updateHabit = useCallback(async (habitId, habitData) => {
        if (!user) return;
        return updateHabitDoc(habitId, habitData);
    }, [user]);

    // Delete a habit
    const deleteHabit = useCallback(async (habitId) => {
        if (!user) return;
        return deleteHabitDoc(habitId);
    }, [user]);

    // Seed sample habits
    const seedHabits = useCallback(async (seedData) => {
        if (!user) return;
        if (habits.length > 0) {
            throw new Error('You already have habits! Delete them first if you want to re-seed.');
        }
        return seedHabitsForUser(user.uid, seedData);
    }, [user, habits.length]);

    return {
        habits,
        todaysHabits,
        loading,
        error,
        addHabit,
        updateHabit,
        deleteHabit,
        seedHabits,
    };
}
