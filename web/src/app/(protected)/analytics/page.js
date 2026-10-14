'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Check, Calendar, TrendingUp, Sparkles, BookOpen, Activity, Headphones, Moon, Award } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { TopNav } from '@/components/ui';
import { getDateString, getDaysAgo, getDayOfWeek, formatDate } from '@/utils/date-helpers';
import { MOVEMENT_SCHEDULE } from '@/lib/fixtures/exercise-plan';
import { OSHO_LIBRARY } from '@/lib/fixtures/osho-library';
import { BRAND } from '@/lib/constants/brand';

// Map day names to Monday-based column index (0=Mon, 6=Sun)
const DAY_TO_COLUMN = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export default function AnalyticsPage() {
  const { habits, dailyLogs, userProfile, fetchDailyLogs } = useData();
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('insights'); // 'insights' | 'calendar'

  // Fetch historical logs on mount
  useEffect(() => {
    fetchDailyLogs();
  }, [fetchDailyLogs]);

  // Generate last 30 days for calendar view
  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = getDaysAgo(i);
      const dow = getDayOfWeek(date);
      return {
        date,
        dateStr: getDateString(date),
        dayOfWeek: dow,
        dayNum: date.getDate(),
        column: DAY_TO_COLUMN[dow],
      };
    }).reverse();
  }, []);

  const firstDayColumn = last30Days[0]?.column || 0;

  // Calculate completion rate for a specific date, strictly excluding planned rest days
  const getDayMetrics = useCallback((dateStr, dayOfWeek) => {
    const activeHabits = habits.filter(h => {
      if (!h.frequency || h.frequency.length === 0) return true;
      return h.frequency.includes(dayOfWeek);
    });

    if (activeHabits.length === 0) {
      return { rate: null, isAllRest: true, scheduledCount: 0, completedCount: 0 };
    }

    // Exclude Sunday exercise from required denominator
    const requiredHabits = activeHabits.filter(h => {
      const isSundayRest = dayOfWeek === 'Sun' &&
        (h.completionMethod === 'exercise_plan' || h.category === 'Movement & Strength');
      return !isSundayRest;
    });

    if (requiredHabits.length === 0) {
      return { rate: 100, isAllRest: true, scheduledCount: 0, completedCount: 0 };
    }

    const logEntry = dailyLogs[dateStr];
    const completedIds = Array.isArray(logEntry)
      ? logEntry
      : (logEntry?.completedHabitIds || []);

    const completedRequired = requiredHabits.filter(h => completedIds.includes(h.id)).length;
    const rate = Math.round((completedRequired / requiredHabits.length) * 100);

    return {
      rate,
      isAllRest: false,
      scheduledCount: requiredHabits.length,
      completedCount: completedRequired,
      isSunday: dayOfWeek === 'Sun',
    };
  }, [habits, dailyLogs]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    let totalActiveDays = 0;
    let completedDays = 0;
    let totalCompletions = 0;
    let workbookSessionsTotal = 0;
    let workoutDaysCompleted = 0;
    let walkDaysCompleted = 0;
    let oshoListeningDays = 0;
    let readingDays = 0;

    for (let i = 0; i < 30; i++) {
      const date = getDaysAgo(i);
      const dateStr = getDateString(date);
      const dow = getDayOfWeek(date);

      const metrics = getDayMetrics(dateStr, dow);
      if (metrics.scheduledCount > 0) {
        totalActiveDays++;
        if (metrics.rate >= 50) completedDays++;
        totalCompletions += metrics.completedCount;
      }

      // Check specific domain completions from log
      const logEntry = dailyLogs[dateStr];
      const completedIds = Array.isArray(logEntry) ? logEntry : (logEntry?.completedHabitIds || []);
      const habitProgress = (!Array.isArray(logEntry) && logEntry?.habitProgress) || {};

      habits.forEach(h => {
        const isDone = completedIds.includes(h.id);
        const prog = habitProgress[h.id] || {};

        if (h.category === 'English Learning' || h.completionMethod === 'workbook_sessions') {
          workbookSessionsTotal += prog.sessionsCompleted || (isDone ? 2 : 0);
        }
        if (h.category === 'Movement & Strength' || h.completionMethod === 'exercise_plan') {
          if (isDone) {
            if (dow === 'Mon' || dow === 'Wed' || dow === 'Fri') workoutDaysCompleted++;
            if (dow === 'Tue' || dow === 'Thu' || dow === 'Sat') walkDaysCompleted++;
          }
        }
        if (h.category === 'Listening & Awareness' || h.completionMethod === 'osho_listening') {
          if (isDone) oshoListeningDays++;
        }
        if (h.category === 'Reading' || h.completionMethod === 'reading_duration') {
          if (isDone) readingDays++;
        }
      });
    }

    const avgRate = totalActiveDays > 0 ? Math.round((completedDays / totalActiveDays) * 100) : 0;

    return {
      totalActiveDays,
      completedDays,
      totalCompletions,
      workbookSessionsTotal,
      workoutDaysCompleted,
      walkDaysCompleted,
      oshoListeningDays,
      readingDays,
      avgRate,
    };
  }, [habits, dailyLogs, getDayMetrics]);

  // Selected date details
  const selectedDateHabits = useMemo(() => {
    if (!selectedDate) return [];
    const dow = getDayOfWeek(selectedDate);
    const logEntry = dailyLogs[selectedDate];
    const completedIds = Array.isArray(logEntry) ? logEntry : (logEntry?.completedHabitIds || []);

    return habits
      .filter(h => !h.frequency || h.frequency.includes(dow))
      .map(h => {
        const isSundayRest = dow === 'Sun' &&
          (h.completionMethod === 'exercise_plan' || h.category === 'Movement & Strength');
        return {
          ...h,
          isCompleted: completedIds.includes(h.id),
          isSundayRest,
        };
      });
  }, [selectedDate, habits, dailyLogs]);

  return (
    <>
      <TopNav title="Insights & Consistency" subtitle="Supportive Rhythm Tracking" />

      {/* Mode Switcher */}
      <div className="max-w-2xl mx-auto px-4 pt-5 sm:pt-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('insights')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'insights'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Supportive Insights
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            30-Day Rhythm Map
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5">
        {/* VIEW 1: Insights & Domain Progress */}
        {viewMode === 'insights' && stats && (
          <div className="space-y-4">
            {/* High-level Rhythm Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-1">
                <span className="text-2xs font-bold text-indigo-500 uppercase tracking-wider block">
                  30-Day Consistency
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {stats.avgRate}%
                </div>
                <p className="text-2xs text-gray-400">
                  {stats.completedDays} of {stats.totalActiveDays} scheduled days fulfilled
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-1">
                <span className="text-2xs font-bold text-teal-500 uppercase tracking-wider block">
                  Total Activities Done
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
                  {stats.totalCompletions}
                </div>
                <p className="text-2xs text-gray-400">Activities completed in 30 days</p>
              </div>
            </div>

            {/* Core Routine Deep Dives */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Domain Consistency Highlights
              </h3>

              <div className="space-y-3">
                {/* 1. Workbook Sessions */}
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Word Power Made Easy</p>
                      <p className="text-2xs text-gray-500">English vocabulary workbook sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-900">
                      {stats.workbookSessionsTotal}
                    </span>
                    <span className="text-2xs text-indigo-700 block">sessions logged</span>
                  </div>
                </div>

                {/* 2. Movement & Rest Routine */}
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">12-Week Movement Plan</p>
                      <p className="text-2xs text-gray-500">
                        {stats.workoutDaysCompleted} strength workouts • {stats.walkDaysCompleted} walk days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      Sunday Rest Protected
                    </span>
                  </div>
                </div>

                {/* 3. Osho Listening */}
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Osho Listening Habit</p>
                      <p className="text-2xs text-gray-500">Daily contemplative listening</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-900">{stats.oshoListeningDays}</span>
                    <span className="text-2xs text-amber-700 block">days listened</span>
                  </div>
                </div>

                {/* 4. Bedtime Reading */}
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Bedtime Reading</p>
                      <p className="text-2xs text-gray-500">30 minutes before sleep</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-900">{stats.readingDays}</span>
                    <span className="text-2xs text-emerald-700 block">evenings read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Punitive Philosophy Callout */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-gray-800">Supportive Analytics Philosophy:</p>
              <p>
                Metrics are calculated only on days when activities are scheduled. Sunday movement is an intentional planned rest day and is excluded from the failure denominator. The goal is long-term sustainable rhythm, not rigid perfection.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: Calendar 30-Day Map */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Last 30 Days Activity Map
                </h3>
                <span className="text-2xs text-gray-400">Tap a date to inspect activities</span>
              </div>

              {/* Day Headers (Mon-Sun) */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-2xs font-bold text-gray-400 py-1 border-b border-gray-100 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
                  <div key={idx}>{d}</div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Spacers for start of calendar offset */}
                {Array.from({ length: firstDayColumn }, (_, i) => (
                  <div key={`spacer-${i}`} />
                ))}

                {last30Days.map(({ dateStr, dayOfWeek, dayNum }) => {
                  const metrics = getDayMetrics(dateStr, dayOfWeek);
                  const isSelected = selectedDate === dateStr;

                  // Calm, supportive color mapping (NO aggressive red!)
                  let cellStyle = 'bg-gray-100 text-gray-600';
                  if (metrics.isSunday) {
                    cellStyle = metrics.rate === 100
                      ? 'bg-emerald-500 text-white'
                      : 'bg-purple-100 text-purple-800 border border-purple-200';
                  } else if (metrics.rate === 100) {
                    cellStyle = 'bg-emerald-500 text-white shadow-2xs';
                  } else if (metrics.rate >= 50) {
                    cellStyle = 'bg-teal-400 text-white';
                  } else if (metrics.rate > 0) {
                    cellStyle = 'bg-amber-300 text-gray-900';
                  } else {
                    cellStyle = 'bg-gray-100 text-gray-400';
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${cellStyle} ${
                        isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105' : 'hover:opacity-85'
                      }`}
                      aria-label={`${dateStr}: ${metrics.rate}% completed`}
                    >
                      <span>{dayNum}</span>
                      {metrics.isSunday && (
                        <span className="text-3xs font-normal opacity-80 leading-none mt-0.5">rest</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-gray-100 text-2xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>100% Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-teal-400" />
                  <span>50%+ Fulfilled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
                  <span>Sunday Rest Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <span>Unscheduled / Open</span>
                </div>
              </div>
            </div>

            {/* Selected Date Inspector */}
            {selectedDate && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    {formatDate(selectedDate)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedDateHabits.map(habit => (
                    <div
                      key={habit.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        habit.isSundayRest
                          ? 'bg-purple-50/60 border-purple-100 text-purple-900'
                          : habit.isCompleted
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            habit.isSundayRest
                              ? 'bg-purple-200 text-purple-800'
                              : habit.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {habit.isSundayRest ? 'R' : habit.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : '–'}
                        </div>
                        <span className="font-semibold">{habit.title}</span>
                      </div>

                      <span className="text-2xs opacity-80">
                        {habit.isSundayRest
                          ? 'Planned Rest'
                          : habit.isCompleted
                          ? 'Completed'
                          : 'Not logged'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
