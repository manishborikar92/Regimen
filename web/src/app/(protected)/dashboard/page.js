'use client';

import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import {
  WorkbookCard,
  MovementCard,
  OshoCard,
  ReadingCard,
  SpeakingCard,
  DiaryCard,
  GenericHabitCard,
  StreakCounter,
} from '@/components/habits';
import { TopNav, LoadingSpinner } from '@/components/ui';
import { formatDate } from '@/utils/date-helpers';
import { BRAND } from '@/lib/constants/brand';
import { Compass, CheckCircle2 } from 'lucide-react';

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
    seedHabits,
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
  const renderHabitCard = (habit) => {
    const isCompleted = todayLog.includes(habit.id);
    const progress = todayProgress[habit.id] || {};

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
  };

  const allCompletedToday = todayStats.total > 0 && todayStats.completed >= todayStats.total;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <TopNav title={BRAND.name} subtitle={formatDate()} />

      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5">
        {/* Supportive Rhythm Counter */}
        <StreakCounter />

        {/* Today's Progress Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Today&apos;s Rhythm
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">
                {todayStats.completed} of {todayStats.total} planned activities completed
              </p>
            </div>
            <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {todayStats.percentage}%
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-teal-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${todayStats.percentage}%` }}
            />
          </div>

          {allCompletedToday && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All planned activities completed for today! Relax and enjoy your evening.</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Empty state: If no habits exist in account */}
        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">Welcome to {BRAND.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Build your daily rhythm by exploring recommended foundation routines or creating custom habits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => seedHabits()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm mx-auto"
            >
              Load Recommended Routines
            </button>
          </div>
        ) : todaysHabits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <p className="text-sm font-bold text-gray-800">No activities scheduled for today.</p>
            <p className="text-xs text-gray-500">Enjoy your unscheduled day! Take rest and recharge.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Flexible / Anytime Routines */}
            {groupedHabits.anytime.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Flexible / Anytime
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
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
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Afternoon (Preferred)
                  </span>
                  <div className="h-px bg-amber-200 flex-1" />
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
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                    Before Bed (Relative)
                  </span>
                  <div className="h-px bg-indigo-200 flex-1" />
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
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Additional Routines
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
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
