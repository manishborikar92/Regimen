'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/use-habits';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useStreak } from '@/hooks/use-streak';

const DataContext = createContext({});

/**
 * DataProvider composes domain-specific hooks into a single context.
 * Each hook owns its own slice of state and Firestore listeners.
 */
export function DataProvider({ children }) {
  const { user } = useAuth();

  const {
    habits,
    todaysHabits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    seedHabits,
  } = useHabits(user);

  const {
    dailyLogs,
    todayLog,
    todayStats,
    toggleHabit,
    fetchDailyLogs,
  } = useDailyLogs(user, todaysHabits);

  const streak = useStreak(habits, dailyLogs);

  const value = {
    // State
    habits,
    dailyLogs,
    todayLog,
    loading,
    error,
    // Computed
    todaysHabits,
    todayStats,
    streak,
    // Actions
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    seedHabits,
    fetchDailyLogs,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
