'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Check,
  Calendar,
  Sparkles,
  BookOpen,
  Activity,
  Headphones,
  BookMarked,
  MessageSquare,
  PenTool,
  Coffee,
  Moon,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { AnalyticsSkeleton } from '@/components/ui';
import { getDayOfWeek, formatDate } from '@/utils/date-helpers';
import {
  calculateDynamicAnalytics,
  isHabitScheduledOnDay,
  isHabitRestDay,
} from '@/utils/analytics-helpers';

// Map day names to Monday-based column index (0=Mon, 6=Sun)
const DAY_TO_COLUMN = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// Icon component lookup for dynamic categories
const CATEGORY_ICON_MAP = {
  BookOpen,
  Activity,
  Headphones,
  BookMarked,
  MessageSquare,
  PenTool,
  Coffee,
  Moon,
  Clock,
  CheckCircle2,
  Sparkles,
};

export default function AnalyticsPage() {
  const { habits, dailyLogs, fetchDailyLogs, loading } = useData();
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('insights'); // 'insights' | 'calendar'

  // Fetch historical logs on mount
  useEffect(() => {
    fetchDailyLogs();
  }, [fetchDailyLogs]);

  // Dynamically calculate analytics data and 30-day metrics
  const analyticsData = useMemo(() => {
    return calculateDynamicAnalytics(habits, dailyLogs, 30);
  }, [habits, dailyLogs]);

  const firstDayColumn = useMemo(() => {
    if (!analyticsData.daysWithMetrics || analyticsData.daysWithMetrics.length === 0) return 0;
    return DAY_TO_COLUMN[analyticsData.daysWithMetrics[0].dayOfWeek] || 0;
  }, [analyticsData.daysWithMetrics]);

  // Selected date details
  const selectedDateHabits = useMemo(() => {
    if (!selectedDate) return [];
    const dow = getDayOfWeek(selectedDate);
    const logEntry = dailyLogs[selectedDate];
    const completedIds = Array.isArray(logEntry) ? logEntry : (logEntry?.completedHabitIds || []);

    return habits
      .filter(h => isHabitScheduledOnDay(h, dow))
      .map(h => {
        const isRest = isHabitRestDay(h, dow);
        return {
          ...h,
          isCompleted: completedIds.includes(h.id),
          isRestDay: isRest,
          isSundayRest: isRest && dow === 'Sun',
        };
      });
  }, [selectedDate, habits, dailyLogs]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5">
      {/* Mode Switcher */}
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

      {/* VIEW 1: Insights & Domain Progress */}
      {viewMode === 'insights' && (
        <div className="space-y-4">
          {/* High-level Rhythm Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-subtle shadow-2xs space-y-1">
              <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                30-Day Consistency
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-main">
                {analyticsData.avgRate}%
              </div>
              <p className="text-2xs text-muted">
                {analyticsData.completedDays} of {analyticsData.totalActiveDays} scheduled days fulfilled
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-4 border border-subtle shadow-2xs space-y-1">
              <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                Total Activities Done
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                {analyticsData.totalCompletions}
              </div>
              <p className="text-2xs text-muted">Activities completed in 30 days</p>
            </div>
          </div>

          {/* Dynamic Domain Consistency Highlights */}
          <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-subtle shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-main flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Domain Consistency Highlights
              </h3>
              <span className="text-2xs text-muted">
                {analyticsData.categories.length} {analyticsData.categories.length === 1 ? 'category' : 'categories'} active
              </span>
            </div>

            {analyticsData.categories.length === 0 ? (
              <div className="p-6 text-center text-muted text-xs space-y-1">
                <p className="font-semibold text-main">No active routines yet</p>
                <p>Create routines in your dashboard to see consistency highlights here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.categories.map(cat => {
                  const Icon = CATEGORY_ICON_MAP[cat.iconName] || Sparkles;

                  return (
                    <div
                      key={cat.category}
                      className="p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-subtle flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg ${
                              cat.badgeClasses ||
                              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            } flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {cat.label}
                            </p>
                            <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">
                              {cat.detailText}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            {cat.metricValue}
                          </span>
                          <span className="text-2xs text-slate-500 dark:text-slate-400 block">
                            {cat.metricUnit}
                          </span>
                        </div>
                      </div>

                      {/* Status / Rest badge & habit breakdown if multiple */}
                      {(cat.badge || cat.habits.length > 1) && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 text-2xs">
                          {cat.badge ? (
                            <span className="font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                              {cat.badge}
                            </span>
                          ) : (
                            <span className="text-muted">{cat.habits.length} routines</span>
                          )}
                          <span className="text-muted font-medium">
                            {cat.rate}% consistency
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Non-Punitive Philosophy Callout */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Supportive Analytics Philosophy:</p>
            <p>
              Metrics are calculated only on days when activities are scheduled. Planned rest days are excluded from the failure denominator. The goal is long-term sustainable rhythm, not rigid perfection.
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

              {analyticsData.daysWithMetrics.map(({ dateStr, dayNum, metrics }) => {
                const isSelected = selectedDate === dateStr;

                // Calm, supportive color mapping (NO aggressive red, slate/teal on Sunday rest)
                let cellStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                if (metrics.isAllRest) {
                  cellStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
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
                    aria-label={`${dateStr}: ${metrics.rate ?? 0}% completed`}
                  >
                    <span>{dayNum}</span>
                    {(metrics.hasPlannedRest || metrics.isAllRest) && (
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
                <span>Planned Rest Day</span>
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
                {selectedDateHabits.length === 0 ? (
                  <p className="text-xs text-muted py-2">No routines scheduled for this day.</p>
                ) : (
                  selectedDateHabits.map(habit => (
                    <div
                      key={habit.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        habit.isRestDay
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          : habit.isCompleted
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            habit.isRestDay
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : habit.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {habit.isRestDay ? 'R' : habit.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : '–'}
                        </div>
                        <span className="font-semibold">{habit.title}</span>
                      </div>

                      <span className="text-2xs opacity-80">
                        {habit.isRestDay
                          ? 'Planned Rest'
                          : habit.isCompleted
                          ? 'Completed'
                          : 'Not logged'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
