'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, getDocs, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import HabitCard from '@/components/HabitCard';
import HabitAccordion from '@/components/HabitAccordion';
import StreakCounter from '@/components/StreakCounter';
import BottomNav from '@/components/BottomNav';
import { getTodayString, getDayOfWeek, formatDate } from '@/utils/dateHelpers';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [completedHabitIds, setCompletedHabitIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = getTodayString();
  const dayOfWeek = getDayOfWeek();
  const formattedDate = formatDate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch habits
  useEffect(() => {
    if (!user) return;

    const fetchHabits = async () => {
      try {
        const habitsRef = collection(db, 'habits');
        const habitsQuery = query(habitsRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(habitsQuery);
        const habitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by order field
        habitsData.sort((a, b) => a.order - b.order);
        setHabits(habitsData);
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError('Failed to load habits');
      }
    };

    fetchHabits();
  }, [user]);


  // Real-time listener for daily log
  useEffect(() => {
    if (!user) return;

    const dailyLogId = `${user.uid}_${today}`;
    const dailyLogRef = doc(db, 'dailyLogs', dailyLogId);

    const unsubscribe = onSnapshot(dailyLogRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletedHabitIds(docSnap.data().completedHabitIds || []);
      } else {
        setCompletedHabitIds([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error listening to daily log:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, today]);

  // Toggle habit completion
  const handleToggle = async (habitId) => {
    if (!user) return;

    const dailyLogId = `${user.uid}_${today}`;
    const dailyLogRef = doc(db, 'dailyLogs', dailyLogId);
    const isCompleted = completedHabitIds.includes(habitId);

    try {
      // Optimistic update
      if (isCompleted) {
        setCompletedHabitIds(prev => prev.filter(id => id !== habitId));
      } else {
        setCompletedHabitIds(prev => [...prev, habitId]);
      }

      // Update Firestore
      if (completedHabitIds.length === 0 && !isCompleted) {
        // Create new daily log document
        await setDoc(dailyLogRef, {
          userId: user.uid,
          date: today,
          completedHabitIds: [habitId],
          createdAt: new Date()
        });
      } else {
        // Update existing document
        await updateDoc(dailyLogRef, {
          completedHabitIds: isCompleted ? arrayRemove(habitId) : arrayUnion(habitId)
        });
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      // Revert optimistic update on error
      if (isCompleted) {
        setCompletedHabitIds(prev => [...prev, habitId]);
      } else {
        setCompletedHabitIds(prev => prev.filter(id => id !== habitId));
      }
    }
  };

  // Filter habits by today's day of week
  const todaysHabits = habits.filter(habit => habit.frequency.includes(dayOfWeek));
  const completedCount = todaysHabits.filter(h => completedHabitIds.includes(h.id)).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Routine Tracker</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Streak Counter */}
        <StreakCounter habits={habits} />

        {/* Progress */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {completedCount} of {todaysHabits.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${todaysHabits.length ? (completedCount / todaysHabits.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Habits List */}
        <div className="space-y-3">
          {todaysHabits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No habits scheduled for today.</p>
              <p className="text-sm mt-2">Enjoy your rest day! 🎉</p>
            </div>
          ) : (
            todaysHabits.map((habit) => {
              const isCompleted = completedHabitIds.includes(habit.id);
              const hasChecklist = habit.checklistItems && habit.checklistItems.length > 0;

              return hasChecklist ? (
                <HabitAccordion
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted}
                  onToggle={handleToggle}
                />
              ) : (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted}
                  onToggle={handleToggle}
                />
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
