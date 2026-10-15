'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/use-habits';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useStreak } from '@/hooks/use-streak';
import { fetchUserProfile, saveUserProfile } from '@/lib/firebase/firestore';
import { DEFAULT_ROUTINES } from '@/lib/seed-data';

const DataContext = createContext({});

/**
 * DataProvider composes domain-specific hooks and profile state into a single context.
 * Provides both binary toggles and rich, activity-specific progress tracking.
 */
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  const {
    habits,
    todaysHabits,
    loading: habitsLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    seedHabits,
  } = useHabits(user);

  const {
    dailyLogs,
    todayLog,
    todayProgress,
    todayStats,
    toggleHabit,
    updateProgress,
    fetchDailyLogs,
  } = useDailyLogs(user, todaysHabits);

  const streak = useStreak(habits, dailyLogs);

  // Fetch long-term user profile & preferences (e.g. 12-week exercise plan, Osho series)
  useEffect(() => {
    if (!user || user.uid?.startsWith('preview-')) {
      queueMicrotask(() => setUserProfile(null));
      return;
    }

    let isMounted = true;
    fetchUserProfile(user.uid).then(profile => {
      if (isMounted && profile) {
        setUserProfile(profile);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save profile updates (e.g. activating exercise plan or updating series talk count)
  const updateProfile = useCallback(async (data) => {
    if (!user) return;
    setUserProfile(prev => ({ ...(prev || {}), ...data }));
    return saveUserProfile(user.uid, data);
  }, [user]);

  const isPreview = Boolean(user && user.uid === 'preview-manish');
  const [previewTodayLog, setPreviewTodayLog] = useState(['preview-1']);
  const [previewProgress, setPreviewProgress] = useState({});

  const previewValue = useMemo(() => {
    if (!isPreview) return null;
    const previewHabits = DEFAULT_ROUTINES.map((routine, idx) => ({
      id: `preview-${idx + 1}`,
      ...routine,
    }));

    const logs = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isSun = d.getDay() === 0;
      logs.push({
        date: dateStr,
        completedHabitIds: isSun
          ? ['preview-1', 'preview-5', 'preview-6']
          : ['preview-1', 'preview-2', 'preview-3', 'preview-4'],
      });
    }

    return {
      habits: previewHabits,
      todaysHabits: previewHabits,
      dailyLogs: logs,
      todayLog: previewTodayLog,
      todayProgress: previewProgress,
      todayStats: {
        total: 6,
        completed: previewTodayLog.length,
        percentage: Math.round((previewTodayLog.length / 6) * 100),
        isSunday: false,
      },
      streak: 14,
      userProfile: {
        movementPlan: { activeWeek: 3, completedWorkouts: 8 },
        oshoSeries: { activeSeriesKey: 'sambhog_se_samadhi', currentTalkNumber: 3 },
      },
      loading: false,
      error: null,
      toggleHabit: (id) => {
        setPreviewTodayLog(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      },
      updateProgress: (id, data) => {
        setPreviewProgress(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...data } }));
      },
      updateProfile: () => {},
      addHabit: () => {},
      updateHabit: () => {},
      deleteHabit: () => {},
      seedHabits: () => {},
      fetchDailyLogs: () => {},
    };
  }, [isPreview, previewTodayLog, previewProgress]);

  const value = previewValue || {
    // State
    habits,
    dailyLogs,
    todayLog,
    todayProgress,
    userProfile,
    loading: habitsLoading,
    error,
    // Computed
    todaysHabits,
    todayStats,
    streak,
    // Actions
    toggleHabit,
    updateProgress,
    updateProfile,
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
