'use client';

import { useState, memo } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Footprints,
  HeartPulse,
  Moon,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import {
  MOVEMENT_SCHEDULE,
  WORKOUT_EXERCISES,
  WALK_DAY_ROUTINE,
  PROGRESSION_PHASES,
  STOP_SIGNALS,
  GENERAL_HEALTH_NOTES,
} from '@/lib/fixtures/exercise-plan';
import { getDayOfWeek } from '@/utils/date-helpers';

function MovementCard({
  habit,
  isCompleted,
  progress = {},
  onUpdateProgress,
  userProfile = {},
  onUpdateProfile,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  const config = getCategoryConfig(habit.category);
  const dayOfWeek = getDayOfWeek();
  const scheduleForToday = MOVEMENT_SCHEDULE[dayOfWeek] || MOVEMENT_SCHEDULE.Mon;
  const isSunday = scheduleForToday.type === 'rest';
  const isWalkDay = scheduleForToday.type === 'walk';
  const isWorkoutDay = scheduleForToday.type === 'workout';

  // Granular completed exercise IDs from progress
  const completedItemIds = progress.completedItemIds || [];

  // 12-Week Plan Activation state
  const exercisePlanState = userProfile?.exercisePlan || {
    activated: false,
    startDate: null,
    currentWeek: 1,
    checkupCompleted: false,
  };

  // Determine items to display based on today's weekday
  const currentItems = isWorkoutDay
    ? WORKOUT_EXERCISES
    : isWalkDay
    ? WALK_DAY_ROUTINE
    : [];

  const allItemsChecked = currentItems.length > 0 && currentItems.every(item => completedItemIds.includes(item.id));
  const isWorkoutComplete = Boolean(isCompleted || progress.workoutCompleted || allItemsChecked);

  const handleToggleItem = (itemId) => {
    const isCurrentlyChecked = completedItemIds.includes(itemId);
    const updatedIds = isCurrentlyChecked
      ? completedItemIds.filter(id => id !== itemId)
      : [...completedItemIds, itemId];

    const nextAllChecked = currentItems.length > 0 && currentItems.every(item => updatedIds.includes(item.id));

    onUpdateProgress(habit.id, {
      ...progress,
      completedItemIds: updatedIds,
      workoutCompleted: nextAllChecked,
    }, nextAllChecked);
  };

  const handleToggleWholeWorkout = () => {
    const nextState = !isWorkoutComplete;
    const updatedIds = nextState ? currentItems.map(item => item.id) : [];

    onUpdateProgress(habit.id, {
      ...progress,
      completedItemIds: updatedIds,
      workoutCompleted: nextState,
    }, nextState);
  };

  const handleActivatePlan = () => {
    if (onUpdateProfile) {
      const todayStr = new Date().toISOString().split('T')[0];
      onUpdateProfile({
        exercisePlan: {
          activated: true,
          startDate: todayStr,
          currentWeek: 1,
          checkupCompleted: false,
        },
      });
    }
  };

  return (
    <>
      <div
        className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
          isSunday
            ? 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 border-t-stone-500 dark:border-t-stone-400'
            : isWorkoutComplete
            ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80 border-t-teal-600 dark:border-t-teal-400'
            : 'border-subtle border-t-teal-600 dark:border-t-teal-400'
        }`}
      >
        <div className="p-3.5 sm:p-5">
          {/* Header Row: Left info, Right quick-action */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Badges in single, clean wrap-resistant row */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                  {habit.category}
                </span>

                <span className="text-2xs sm:text-xs text-teal-800 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                  {dayOfWeek}: {scheduleForToday.label}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
                {isSunday ? (
                  <Moon className="w-5 h-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
                ) : isWalkDay ? (
                  <Footprints className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                ) : (
                  <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                )}
                <span>{habit.title}</span>
              </h3>

              <p className="text-xs text-sub mt-0.5 leading-relaxed">
                {scheduleForToday.target} • Afternoon preferred
              </p>
            </div>

            {/* Quick Completion Button / Sunday Rest Pill */}
            <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
              {isSunday ? (
                <span className="text-2xs sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  Planned Rest
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleWholeWorkout}
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
                    isWorkoutComplete
                      ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-600 text-white shadow-xs'
                      : 'border-stone-300 dark:border-stone-600 hover:border-teal-500 text-transparent'
                  }`}
                  aria-label={isWorkoutComplete ? 'Mark workout incomplete' : 'Mark workout complete'}
                >
                  {isWorkoutComplete && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                </button>
              )}
            </div>
          </div>

          {/* Sunday Rest Day Banner */}
          {isSunday && (
            <div className="mt-3.5 p-3.5 sm:p-4 bg-stone-100/80 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">Sunday Planned Rest & Recovery</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  No workout is scheduled today. Planned rest allows your muscles, nervous system, and connective tissue to repair and rebuild. This day is excluded from completion rate statistics.
                </p>
              </div>
            </div>
          )}

          {/* Non-Sunday Movement Progress and Checklist */}
          {!isSunday && (
            <div className="mt-3 p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200/70 dark:border-stone-800/70 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-2xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    {isWorkoutDay ? 'Strength Routine Steps' : 'Walk & Mobility Steps'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                    {completedItemIds.length} of {currentItems.length} exercises logged
                  </p>
                </div>

                {/* Exercises Toggle with Integrated Right-Aligned Chevron */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="min-h-[44px] px-2.5 py-1 text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold flex items-center gap-1 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <span>{isExpanded ? 'Collapse' : `View all ${currentItems.length} steps`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-teal-600 dark:bg-teal-500 transition-all duration-300"
                  style={{
                    width: `${currentItems.length > 0 ? (completedItemIds.length / currentItems.length) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Expandable Exercise Checklist: Polished Mobile-First Layout */}
              {isExpanded && (
                <div className="space-y-2.5 pt-1 border-t border-stone-200/80 dark:border-stone-700/80">
                  {currentItems.map((item, idx) => {
                    const isChecked = completedItemIds.includes(item.id);
                    const isItemDetailsOpen = expandedExerciseId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60'
                            : 'bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.id)}
                            className="mt-0.5 w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-stone-300 dark:border-stone-600 dark:bg-stone-900 flex-shrink-0 cursor-pointer"
                            id={`ex_${item.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            {/* Responsive Title & Target: flex-col on mobile, flex-row on larger viewports */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <label
                                htmlFor={`ex_${item.id}`}
                                className={`text-xs sm:text-sm font-semibold cursor-pointer leading-snug ${
                                  isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {idx + 1}. {item.name}
                              </label>
                              <span className="self-start sm:self-auto text-2xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded font-medium border border-teal-200 dark:border-teal-800/60">
                                {item.target || item.reps}
                              </span>
                            </div>

                            {item.rest && item.rest !== 'None' && (
                              <p className="text-2xs text-stone-400 dark:text-stone-500 mt-1">Rest: {item.rest}</p>
                            )}

                            {/* Details toggle with accessible touch target */}
                            <button
                              type="button"
                              onClick={() => setExpandedExerciseId(isItemDetailsOpen ? null : item.id)}
                              className="text-2xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 font-medium min-h-[36px] py-1 transition-colors"
                            >
                              <span>{isItemDetailsOpen ? 'Hide form tips' : 'Form instructions & variations'}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isItemDetailsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isItemDetailsOpen && (
                              <div className="mt-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900/60 p-3 rounded-lg space-y-1.5 border border-stone-200/80 dark:border-stone-700/80 leading-relaxed">
                                <p><strong className="text-stone-900 dark:text-stone-100">Form:</strong> {item.instructions}</p>
                                {item.easierVariation && (
                                  <p className="text-amber-800 dark:text-amber-400">
                                    <strong className="text-amber-900 dark:text-amber-300">Easier:</strong> {item.easierVariation}
                                  </p>
                                )}
                                {item.harderVariation && (
                                  <p className="text-teal-800 dark:text-teal-300">
                                    <strong className="text-teal-900 dark:text-teal-200">Progression:</strong> {item.harderVariation}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Links: 12-Week Plan & Safety Details */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/80 dark:border-stone-800/80 text-xs">
            <button
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="min-h-[44px] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 font-medium py-2 transition-colors"
            >
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>12-Week Plan, Safety & Stop Signals</span>
            </button>

            {exercisePlanState.activated ? (
              <span className="text-2xs sm:text-xs text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800/60">
                Week {exercisePlanState.currentWeek || 1} of 12
              </span>
            ) : (
              <button
                type="button"
                onClick={handleActivatePlan}
                className="min-h-[44px] text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold underline flex items-center py-2"
              >
                Start 12-Week Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Progression Modal (Standardized Vritta Modal Architecture) */}
      {showSafetyModal && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSafetyModal(false);
          }}
        >
          <div className="bg-surface rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[92vh] flex flex-col shadow-2xl border-t sm:border border-subtle overflow-hidden">
            {/* Sticky Header with Permanent Close Button */}
            <div className="bg-surface border-b border-subtle px-5 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-700 dark:text-rose-400 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-main">
                    Movement Safety & 12-Week Plan
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 min-h-0">
              {/* Medical Check-up Caution Banner */}
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1">
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                  Important Medical Guardrail
                </p>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  Prepared for low body weight restoration. A medical check-up is explicitly recommended within the first 4 weeks (ideally before Week 5). Please remain at 2 sets until that medical evaluation has taken place.
                </p>
              </div>

              {/* Stop Signals */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">Stop Signals — Cease Exercise Immediately:</h4>
                <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                  {STOP_SIGNALS.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 12-Week Progression Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">12-Week Progression Structure:</h4>
                <div className="space-y-2">
                  {PROGRESSION_PHASES.map((phase, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg text-xs space-y-1 border border-stone-200/80 dark:border-stone-700/80">
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 dark:text-stone-100 font-bold">{phase.phase}</strong>
                        <span className="text-teal-700 dark:text-teal-300 font-semibold">{phase.targetSets}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400">{phase.guidance}</p>
                      <p className="text-amber-800 dark:text-amber-400 font-medium">⚠️ {phase.caution}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Health Notes */}
              <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300 bg-teal-50/50 dark:bg-teal-950/30 p-3 rounded-lg border border-teal-100 dark:border-teal-900/40">
                <p className="font-semibold text-teal-900 dark:text-teal-200">General Recovery Guidance:</p>
                <ul className="list-disc pl-4 space-y-1 text-teal-950 dark:text-teal-300">
                  {GENERAL_HEALTH_NOTES.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(MovementCard);
