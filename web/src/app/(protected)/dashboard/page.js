'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import {
  WorkbookCard,
  MovementCard,
  OshoCard,
  ReadingCard,
  SpeakingCard,
  DiaryCard,
  GenericHabitCard,
  TodayRhythmBanner,
} from '@/components/habits';
import { TopNav, DashboardSkeleton } from '@/components/ui';
import { formatDate } from '@/utils/date-helpers';
import { BRAND } from '@/lib/constants/brand';
import { Compass } from 'lucide-react';

const EMPTY_PROGRESS = Object.freeze({});

export default function DashboardPage() {

  const {
    habits,
    todaysHabits,
    todayLog,
    todayProgress,
    todayStats,
    userProfile,
    loading,
    error,
    toggleHabit,
    updateProgress,
    updateProfile,
  } = useData();

  // Group habits by time context: Flexible / Afternoon / Before Bed
  const groupedHabits = useMemo(() => {
    const anytime = [];
    const afternoon = [];
    const beforeBed = [];
    const other = [];

    todaysHabits.forEach(habit => {
      const timingType = habit.timingType || '';
      const period = habit.preferredPeriod || habit.time || '';
      const relative = habit.relativeTiming || '';

      if (relative === 'Before bed' || period === 'Before bed') {
        beforeBed.push(habit);
      } else if (period.toLowerCase().includes('afternoon') || timingType === 'preferred_period') {
        afternoon.push(habit);
      } else if (timingType === 'anytime' || period === 'Flexible' || !period) {
        anytime.push(habit);
      } else {
        other.push(habit);
      }
    });

    return { anytime, afternoon, beforeBed, other };
  }, [todaysHabits]);

  // Helper to render the appropriate activity-specific card
  const renderHabitCard = useCallback((habit) => {
    const isCompleted = todayLog.includes(habit.id);
    const progress = todayProgress[habit.id] || EMPTY_PROGRESS;

    const key = habit.stableKey || habit.id;
    const method = habit.completionMethod || '';
    const title = (habit.title || '').toLowerCase();

    // 1. Workbook Card
    if (key === 'canonical_english_workbook' || method === 'workbook_sessions' || title.includes('workbook')) {
      return (
        <WorkbookCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onUpdateProgress={updateProgress}
        />
      );
    }

    // 2. Exercise / Movement Card
    if (key === 'canonical_exercise_plan' || method === 'exercise_plan' || title.includes('exercise') || title.includes('movement')) {
      return (
        <MovementCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onUpdateProgress={updateProgress}
          userProfile={userProfile}
          onUpdateProfile={updateProfile}
        />
      );
    }

    // 3. Listen to Osho Card
    if (key === 'canonical_listen_osho' || method === 'osho_listening' || title.includes('osho')) {
      return (
        <OshoCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onToggle={toggleHabit}
          onUpdateProgress={updateProgress}
          userProfile={userProfile}
          onUpdateProfile={updateProfile}
        />
      );
    }

    // 4. Read Books Card
    if (key === 'canonical_read_books' || method === 'reading_duration' || title.includes('read books')) {
      return (
        <ReadingCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onToggle={toggleHabit}
          onUpdateProgress={updateProgress}
        />
      );
    }

    // 5. Practice English Speaking Card
    if (key === 'canonical_english_speaking' || method === 'simple_with_notes' || title.includes('speaking')) {
      return (
        <SpeakingCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onToggle={toggleHabit}
          onUpdateProgress={updateProgress}
        />
      );
    }

    // 6. Maintain a Diary Card
    if (key === 'canonical_maintain_diary' || method === 'diary_entry' || title.includes('diary')) {
      return (
        <DiaryCard
          key={habit.id}
          habit={habit}
          isCompleted={isCompleted}
          progress={progress}
          onToggle={toggleHabit}
          onUpdateProgress={updateProgress}
        />
      );
    }

    // Fallback: Generic Card
    return (
      <GenericHabitCard
        key={habit.id}
        habit={habit}
        isCompleted={isCompleted}
        onToggle={toggleHabit}
      />
    );
  }, [todayLog, todayProgress, userProfile, updateProgress, toggleHabit, updateProfile]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <TopNav title={BRAND.name} subtitle={formatDate()} />

      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5">
        {/* Unified Today's Rhythm Banner */}
        <TodayRhythmBanner />

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-200 text-xs">
            {error}
          </div>
        )}

        {/* Empty state: If no habits exist in account */}
        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-surface rounded-2xl border border-subtle shadow-2xs space-y-4">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center mx-auto text-teal-700 dark:text-teal-400 shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-main">Welcome to {BRAND.name}</h3>
              <p className="text-xs text-sub leading-relaxed">
                Build your daily rhythm by exploring recommended foundation routines or creating custom habits.
              </p>
            </div>
            <Link
              href="/habits"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors shadow-2xs mx-auto"
            >
              Open Routine Manager
            </Link>
          </div>
        ) : todaysHabits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-surface rounded-2xl border border-subtle shadow-2xs space-y-2">
            <p className="text-sm font-bold text-main">No activities scheduled for today.</p>
            <p className="text-xs text-sub">Enjoy your unscheduled day! Take rest and recharge.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Flexible / Anytime Routines */}
            {groupedHabits.anytime.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-sub uppercase tracking-wider">
                    Flexible / Anytime
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <div className="space-y-3">
                  {groupedHabits.anytime.map(renderHabitCard)}
                </div>
              </section>
            )}

            {/* 2. Afternoon Preferred (Movement Plan) */}
            {groupedHabits.afternoon.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Afternoon (Preferred)
                  </span>
                  <div className="h-px bg-amber-200 dark:bg-amber-900/50 flex-1" />
                </div>
                <div className="space-y-3">
                  {groupedHabits.afternoon.map(renderHabitCard)}
                </div>
              </section>
            )}

            {/* 3. Before Bed (Reading) */}
            {groupedHabits.beforeBed.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    Before Bed (Relative)
                  </span>
                  <div className="h-px bg-teal-200 dark:bg-teal-900/50 flex-1" />
                </div>
                <div className="space-y-3">
                  {groupedHabits.beforeBed.map(renderHabitCard)}
                </div>
              </section>
            )}

            {/* 4. Other Scheduled */}
            {groupedHabits.other.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-sub uppercase tracking-wider">
                    Additional Routines
                  </span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <div className="space-y-3">
                  {groupedHabits.other.map(renderHabitCard)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}
