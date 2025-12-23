'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useData } from '@/contexts';
import { BottomNav, TopNav } from '@/components/ui';
import { getDateString, getDaysAgo, getDayOfWeek, formatDate } from '@/utils/dateHelpers';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const { habits, dailyLogs, loading: dataLoading, fetchDailyLogs } = useData();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'stats'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch historical logs for analytics
  useEffect(() => {
    if (user) {
      fetchDailyLogs(90);
    }
  }, [user, fetchDailyLogs]);

  const loading = authLoading || dataLoading;

  // Generate last 30 days for calendar view
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = getDaysAgo(i);
    return {
      date,
      dateStr: getDateString(date),
      dayOfWeek: getDayOfWeek(date),
      dayNum: date.getDate(),
    };
  }).reverse();

  // Calculate completion rate for a specific date
  const getCompletionRate = (dateStr, dayOfWeek) => {
    const activeHabits = habits.filter(h => h.frequency?.includes(dayOfWeek));
    if (activeHabits.length === 0) return null;
    
    const completed = dailyLogs[dateStr]?.length || 0;
    return Math.round((completed / activeHabits.length) * 100);
  };

  // Calculate overall stats
  const calculateStats = () => {
    let totalDays = 0;
    let completedDays = 0;
    let totalHabitsCompleted = 0;
    let perfectDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 30; i++) {
      const date = getDaysAgo(i);
      const dateStr = getDateString(date);
      const dayOfWeek = getDayOfWeek(date);
      const activeHabits = habits.filter(h => h.frequency?.includes(dayOfWeek));
      
      if (activeHabits.length === 0) continue;
      
      totalDays++;
      const completed = dailyLogs[dateStr]?.length || 0;
      totalHabitsCompleted += completed;
      
      const rate = completed / activeHabits.length;
      if (rate >= 0.5) {
        completedDays++;
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
        if (i === 0) currentStreak = 0;
      }
      
      if (rate === 1) perfectDays++;
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      totalDays,
      completedDays,
      totalHabitsCompleted,
      perfectDays,
      currentStreak,
      longestStreak,
      avgCompletion: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
    };
  };

  const stats = habits.length > 0 ? calculateStats() : null;


  // Get details for selected date
  const getDateDetails = (dateStr) => {
    const date = new Date(dateStr);
    const dayOfWeek = getDayOfWeek(date);
    const activeHabits = habits.filter(h => h.frequency?.includes(dayOfWeek));
    const completedIds = dailyLogs[dateStr] || [];
    
    return activeHabits.map(habit => ({
      ...habit,
      completed: completedIds.includes(habit.id)
    }));
  };

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
      <TopNav title="Analytics">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Statistics
          </button>
        </div>
      </TopNav>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {viewMode === 'stats' && stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-bold text-orange-500">🔥 {stats.currentStreak}</div>
                <div className="text-sm text-gray-500 mt-1">Current Streak</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-bold text-purple-500">{stats.longestStreak}</div>
                <div className="text-sm text-gray-500 mt-1">Longest Streak</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-500">{stats.avgCompletion}%</div>
                <div className="text-sm text-gray-500 mt-1">Avg Completion</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-3xl font-bold text-green-500">{stats.perfectDays}</div>
                <div className="text-sm text-gray-500 mt-1">Perfect Days</div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Last 30 Days Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Days with 50%+ completion</span>
                  <span className="font-medium">{stats.completedDays} / {stats.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total habits completed</span>
                  <span className="font-medium">{stats.totalHabitsCompleted}</span>
                </div>
              </div>
            </div>

            {/* Per-Habit Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Habit Performance</h3>
              <div className="space-y-3">
                {habits.map(habit => {
                  let completed = 0;
                  let total = 0;
                  for (let i = 0; i < 30; i++) {
                    const date = getDaysAgo(i);
                    const dateStr = getDateString(date);
                    const dayOfWeek = getDayOfWeek(date);
                    if (habit.frequency?.includes(dayOfWeek)) {
                      total++;
                      if (dailyLogs[dateStr]?.includes(habit.id)) completed++;
                    }
                  }
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <div key={habit.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate flex-1">{habit.title}</span>
                        <span className="text-gray-500 ml-2">{completed}/{total} ({rate}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {viewMode === 'calendar' && (
          <>
            {/* Calendar Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Last 30 Days</h3>
              <div className="grid grid-cols-7 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
                {last30Days.map(({ dateStr, dayOfWeek, dayNum }) => {
                  const rate = getCompletionRate(dateStr, dayOfWeek);
                  const isSelected = selectedDate === dateStr;
                  
                  let bgColor = 'bg-gray-100';
                  if (rate === null) bgColor = 'bg-gray-50';
                  else if (rate === 100) bgColor = 'bg-green-500';
                  else if (rate >= 75) bgColor = 'bg-green-400';
                  else if (rate >= 50) bgColor = 'bg-yellow-400';
                  else if (rate > 0) bgColor = 'bg-orange-400';
                  else bgColor = 'bg-red-400';

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                        ${rate === null ? 'text-gray-300' : 'text-white'} 
                        ${bgColor}
                        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        hover:opacity-80`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-400"></div>
                  <span>0%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-400"></div>
                  <span>50%+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {formatDate(new Date(selectedDate))}
                </h3>
                <div className="space-y-2">
                  {getDateDetails(selectedDate).map(habit => (
                    <div
                      key={habit.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        habit.completed ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        habit.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                        {habit.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${habit.completed ? 'text-green-700' : 'text-gray-600'}`}>
                          {habit.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{habit.time}</span>
                    </div>
                  ))}
                  {getDateDetails(selectedDate).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No habits scheduled for this day</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}