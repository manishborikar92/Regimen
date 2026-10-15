'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Check, Calendar, TrendingUp, Sparkles, BookOpen, Activity, Headphones, Moon, Award } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { TopNav, AnalyticsSkeleton } from '@/components/ui';
import { getDateString, getDaysAgo, getDayOfWeek, formatDate } from '@/utils/date-helpers';
import { BRAND } from '@/lib/constants/brand';

// Map day names to Monday-based column index (0=Mon, 6=Sun)
const DAY_TO_COLUMN = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export default function AnalyticsPage() {
  const { habits, dailyLogs, userProfile, fetchDailyLogs, loading } = useData();
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

  // Memoize 30-day activity map with metrics precalculated once
  const last30DaysWithMetrics = useMemo(() => {
    return last30Days.map(item => ({
      ...item,
      metrics: getDayMetrics(item.dateStr, item.dayOfWeek),
    }));
  }, [last30Days, getDayMetrics]);

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

    for (const { dateStr, dayOfWeek: dow, metrics } of last30DaysWithMetrics) {
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
  }, [habits, dailyLogs, last30DaysWithMetrics]);

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

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <>
      <TopNav title="Insights & Consistency" subtitle="Supportive Rhythm Tracking" />

      {/* Mode Switcher */}
      <div className="max-w-2xl mx-auto px-4 pt-5 sm:pt-6">
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('insights')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'insights'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Supportive Insights
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
              <div className="bg-surface rounded-2xl p-4 border border-subtle shadow-2xs space-y-1">
                <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  30-Day Consistency
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-main">
                  {stats.avgRate}%
                </div>
                <p className="text-2xs text-muted">
                  {stats.completedDays} of {stats.totalActiveDays} scheduled days fulfilled
                </p>
              </div>

              <div className="bg-surface rounded-2xl p-4 border border-subtle shadow-2xs space-y-1">
                <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  Total Activities Done
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  {stats.totalCompletions}
                </div>
                <p className="text-2xs text-muted">Activities completed in 30 days</p>
              </div>
            </div>

            {/* Core Routine Deep Dives */}
            <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-subtle shadow-2xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-main flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Domain Consistency Highlights
              </h3>

              <div className="space-y-3">
                {/* 1. Workbook Sessions */}
                <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-teal-100/60 dark:border-teal-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">English Vocabulary Workbook</p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400">English vocabulary workbook sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-teal-950 dark:text-teal-200">
                      {stats.workbookSessionsTotal}
                    </span>
                    <span className="text-2xs text-teal-700 dark:text-teal-400 block">sessions logged</span>
                  </div>
                </div>

                {/* 2. Movement & Rest Routine */}
                <div className="p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-teal-100/60 dark:border-teal-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">12-Week Movement Plan</p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400">
                        {stats.workoutDaysCompleted} strength workouts • {stats.walkDaysCompleted} walk days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                      Sunday Rest Protected
                    </span>
                  </div>
                </div>

                {/* 3. Osho Listening */}
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-100/60 dark:border-amber-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Osho Listening Habit</p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400">Daily contemplative listening</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-950 dark:text-amber-200">{stats.oshoListeningDays}</span>
                    <span className="text-2xs text-amber-700 dark:text-amber-400 block">days listened</span>
                  </div>
                </div>

                {/* 4. Bedtime Reading */}
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Bedtime Reading</p>
                      <p className="text-2xs text-slate-500 dark:text-slate-400">30 minutes before sleep</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">{stats.readingDays}</span>
                    <span className="text-2xs text-emerald-700 dark:text-emerald-400 block">evenings read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Punitive Philosophy Callout */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Supportive Analytics Philosophy:</p>
              <p>
                Metrics are calculated only on days when activities are scheduled. Sunday movement is an intentional planned rest day and is excluded from the failure denominator. The goal is long-term sustainable rhythm, not rigid perfection.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: Calendar 30-Day Map */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-subtle shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-main flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Last 30 Days Activity Map
                </h3>
                <span className="text-2xs text-muted">Tap a date to inspect activities</span>
              </div>

              {/* Day Headers (Mon-Sun) */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-2xs font-bold text-muted py-1 border-b border-subtle mb-2">
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

                {last30DaysWithMetrics.map(({ dateStr, dayOfWeek, dayNum, metrics }) => {
                  const isSelected = selectedDate === dateStr;

                  // Calm, supportive color mapping (NO aggressive red, slate/teal on Sunday rest)
                  let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                  if (metrics.isSunday) {
                    cellStyle = metrics.rate === 100
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
                  } else if (metrics.rate === 100) {
                    cellStyle = 'bg-emerald-500 text-white shadow-2xs';
                  } else if (metrics.rate >= 50) {
                    cellStyle = 'bg-teal-500 text-white';
                  } else if (metrics.rate > 0) {
                    cellStyle = 'bg-amber-400 text-slate-900';
                  } else {
                    cellStyle = 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500';
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${cellStyle} ${
                        isSelected ? 'ring-2 ring-teal-600 dark:ring-teal-400 ring-offset-2 ring-offset-surface scale-105' : 'hover:opacity-85'
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
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-subtle text-2xs text-sub">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>100% Complete</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-teal-500" />
                  <span>50%+ Fulfilled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                  <span>Sunday Rest Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  <span>Unscheduled / Open</span>
                </div>
              </div>
            </div>

            {/* Selected Date Inspector */}
            {selectedDate && (
              <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-subtle shadow-2xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-subtle">
                  <h4 className="text-xs sm:text-sm font-bold text-main">
                    {formatDate(selectedDate)}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-xs text-muted hover:text-main"
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
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          : habit.isCompleted
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            habit.isSundayRest
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : habit.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
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
