'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  arrayUnion, 
  arrayRemove, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayString, getDayOfWeek, getDateString, getDaysAgo } from '@/utils/dateHelpers';

const DataContext = createContext({});

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({});
  const [todayLog, setTodayLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  const today = getTodayString();
  const dayOfWeek = getDayOfWeek();

  // Fetch all habits for the user (one-time fetch with real-time updates)
  useEffect(() => {
    if (!user || !db) {
      // Only set loading false after initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        Promise.resolve().then(() => setLoading(false));
      }
      return;
    }

    isInitialMount.current = false;
    
    const habitsRef = collection(db, 'habits');
    const habitsQuery = query(habitsRef, where('userId', '==', user.uid));

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

  // Real-time listener for today's daily log
  useEffect(() => {
    if (!user || !db) return;

    const dailyLogId = `${user.uid}_${today}`;
    const dailyLogRef = doc(db, 'dailyLogs', dailyLogId);

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


  // Fetch historical daily logs (for analytics)
  const fetchDailyLogs = useCallback(async (days = 30) => {
    if (!user || !db) return;

    try {
      const logsRef = collection(db, 'dailyLogs');
      const logsQuery = query(
        logsRef,
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(logsQuery);
      
      const logsMap = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        logsMap[data.date] = data.completedHabitIds || [];
      });
      setDailyLogs(prev => ({ ...prev, ...logsMap }));
      return logsMap;
    } catch (err) {
      console.error('Error fetching daily logs:', err);
      return {};
    }
  }, [user]);

  // Toggle habit completion for today
  const toggleHabit = useCallback(async (habitId) => {
    if (!user || !db) return;

    const dailyLogId = `${user.uid}_${today}`;
    const dailyLogRef = doc(db, 'dailyLogs', dailyLogId);
    const isCompleted = todayLog.includes(habitId);

    // Optimistic update
    const newTodayLog = isCompleted 
      ? todayLog.filter(id => id !== habitId)
      : [...todayLog, habitId];
    setTodayLog(newTodayLog);

    try {
      if (todayLog.length === 0 && !isCompleted) {
        await setDoc(dailyLogRef, {
          userId: user.uid,
          date: today,
          completedHabitIds: [habitId],
          createdAt: new Date()
        });
      } else {
        await updateDoc(dailyLogRef, {
          completedHabitIds: isCompleted ? arrayRemove(habitId) : arrayUnion(habitId)
        });
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      // Revert optimistic update
      setTodayLog(todayLog);
    }
  }, [user, today, todayLog]);

  // Add a new habit
  const addHabit = useCallback(async (habitData) => {
    if (!user || !db) return;

    try {
      await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  }, [user]);

  // Update an existing habit
  const updateHabit = useCallback(async (habitId, habitData) => {
    if (!user || !db) return;

    try {
      await updateDoc(doc(db, 'habits', habitId), {
        ...habitData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  }, [user]);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId) => {
    if (!user || !db) return;

    try {
      await deleteDoc(doc(db, 'habits', habitId));
      return true;
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }, [user]);


  // Seed sample habits
  const seedHabits = useCallback(async (seedData) => {
    if (!user || !db) return;

    const habitsRef = collection(db, 'habits');
    
    // Check if user already has habits
    if (habits.length > 0) {
      throw new Error('You already have habits! Delete them first if you want to re-seed.');
    }

    try {
      const promises = seedData.map(habit => 
        addDoc(habitsRef, {
          ...habit,
          userId: user.uid,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('Error seeding habits:', err);
      throw err;
    }
  }, [user, habits.length]);

  // Calculate streak
  const calculateStreak = useCallback(() => {
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
        continue; // Today not complete yet
      } else {
        break;
      }
    }
    return currentStreak;
  }, [habits, dailyLogs]);

  // Get today's habits filtered by day of week
  const todaysHabits = useMemo(() => {
    return habits.filter(habit => habit.frequency?.includes(dayOfWeek));
  }, [habits, dayOfWeek]);

  // Get completion stats for today
  const todayStats = useMemo(() => {
    const total = todaysHabits.length;
    const completed = todaysHabits.filter(h => todayLog.includes(h.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [todaysHabits, todayLog]);

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
    streak: calculateStreak(),
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
