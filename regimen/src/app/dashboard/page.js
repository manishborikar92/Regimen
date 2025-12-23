'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { HabitCard, HabitAccordion, StreakCounter } from '@/components/habits';
import { BottomNav, TopNav } from '@/components/ui';
import { formatDate } from '@/utils/dateHelpers';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { todaysHabits, todayLog, todayStats, loading: dataLoading, error, toggleHabit } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopNav title="Routine Tracker" subtitle={formatDate()} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <StreakCounter />

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today&apos;s Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {todayStats.completed} of {todayStats.total} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {todaysHabits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No habits scheduled for today.</p>
              <p className="text-sm mt-2">Enjoy your rest day! 🎉</p>
            </div>
          ) : (
            todaysHabits.map((habit) => {
              const isCompleted = todayLog.includes(habit.id);
              const hasChecklist = habit.checklistItems?.length > 0;

              return hasChecklist ? (
                <HabitAccordion
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted}
                  onToggle={toggleHabit}
                />
              ) : (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted}
                  onToggle={toggleHabit}
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
