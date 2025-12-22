'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { getDateString, getDaysAgo, getDayOfWeek } from '@/utils/dateHelpers';

export default function StreakCounter({ habits }) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !habits.length) {
      setLoading(false);
      return;
    }

    const calculateStreak = async () => {
      try {
        // Fetch last 30 days of daily logs
        const logsRef = collection(db, 'dailyLogs');
        const q = query(
          logsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        
        const logs = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          logs[data.date] = data.completedHabitIds || [];
        });

        // Calculate streak from today backward
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = getDaysAgo(i);
          const dateStr = getDateString(checkDate);
          const dayOfWeek = getDayOfWeek(checkDate);
          
          // Get habits active on this day
          const activeHabits = habits.filter(h => h.frequency.includes(dayOfWeek));
          if (activeHabits.length === 0) continue;
          
          const completedCount = logs[dateStr]?.length || 0;
          const completionRate = completedCount / activeHabits.length;
          
          // Day counts as complete if >= 50% completion
          if (completionRate >= 0.5) {
            currentStreak++;
          } else if (i === 0) {
            // Today not complete yet, don't break streak
            continue;
          } else {
            break;
          }
        }
        
        setStreak(currentStreak);
      } catch (error) {
        console.error('Error calculating streak:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStreak();
  }, [user, habits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl">
        <div className="animate-pulse text-gray-400">Loading streak...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl">
      <span className="text-4xl">🔥</span>
      <div>
        <span className="text-3xl font-bold text-orange-600">{streak}</span>
        <span className="text-lg text-orange-700 ml-2">Day Streak</span>
      </div>
    </div>
  );
}
