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
        className={`relative rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-sm transition-all duration-200 hover:shadow-md ${
          isSunday
            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
            : isWorkoutComplete
            ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80'
            : ''
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full rounded-t-xl bg-gradient-to-r ${
            isSunday
              ? 'from-slate-400 to-teal-600 dark:from-slate-600 dark:to-teal-500'
              : 'from-teal-500 to-emerald-500'
          } ${isWorkoutComplete || isSunday ? 'opacity-80' : 'opacity-40'}`}
        />

        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                  {habit.category}
                </span>

                <span className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md font-medium">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Afternoon (Preferred)
                </span>

                <span className="text-xs text-teal-800 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                  {dayOfWeek}: {scheduleForToday.label}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {isSunday ? (
                  <Moon className="w-5 h-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
                ) : isWalkDay ? (
                  <Footprints className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                ) : (
                  <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                )}
                {habit.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {scheduleForToday.target} • Preferred in the afternoon, but anytime today counts.
              </p>
            </div>

            {/* Quick Completion / Rest Status */}
            <div className="flex flex-col items-end flex-shrink-0">
              {isSunday ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Planned Rest
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleWholeWorkout}
                  className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
                    isWorkoutComplete
                      ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500 text-transparent'
                  }`}
                  aria-label={isWorkoutComplete ? 'Mark workout incomplete' : 'Mark workout complete'}
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          {/* Sunday Rest Day Banner */}
          {isSunday && (
            <div className="mt-4 p-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sunday Planned Rest & Recovery</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  No workout is scheduled today. Planned rest allows your muscles, nervous system, and connective tissue to repair and rebuild. This day is excluded from completion rate statistics. Enjoy your day!
                </p>
              </div>
            </div>
          )}

          {/* Non-Sunday Movement Progress and Checklist */}
          {!isSunday && (
            <div className="mt-4 p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {isWorkoutDay ? 'Strength Routine Steps' : 'Walk & Mobility Steps'}
                  </span>
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                    {completedItemIds.length} of {currentItems.length} exercises logged
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium flex items-center gap-1"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  {isExpanded ? 'Collapse exercises' : `View all ${currentItems.length} steps`}
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-teal-600 dark:bg-teal-500 transition-all duration-300"
                  style={{
                    width: `${currentItems.length > 0 ? (completedItemIds.length / currentItems.length) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Expandable Exercise Checklist */}
              {isExpanded && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {currentItems.map((item, idx) => {
                    const isChecked = completedItemIds.includes(item.id);
                    const isItemDetailsOpen = expandedExerciseId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800/60'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(item.id)}
                            className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                            id={`ex_${item.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={`ex_${item.id}`}
                                className={`text-xs sm:text-sm font-semibold cursor-pointer ${
                                  isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {idx + 1}. {item.name}
                              </label>
                              <span className="text-2xs sm:text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded font-medium border border-teal-200 dark:border-teal-800/60">
                                {item.target || item.reps}
                              </span>
                            </div>

                            {item.rest && item.rest !== 'None' && (
                              <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">Rest: {item.rest}</p>
                            )}

                            {/* Details toggle */}
                            <button
                              type="button"
                              onClick={() => setExpandedExerciseId(isItemDetailsOpen ? null : item.id)}
                              className="text-2xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 mt-1 flex items-center gap-0.5 font-medium"
                            >
                              {isItemDetailsOpen ? 'Hide form tips' : 'Form instructions & variations'}
                            </button>

                            {isItemDetailsOpen && (
                              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-md space-y-1.5 border border-slate-200/80 dark:border-slate-700/80">
                                <p><strong className="text-slate-900 dark:text-slate-100">Form:</strong> {item.instructions}</p>
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 font-medium"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              12-Week Plan, Safety & Stop Signals
            </button>

            {exercisePlanState.activated ? (
              <span className="text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                Week {exercisePlanState.currentWeek || 1} of 12
              </span>
            ) : (
              <button
                type="button"
                onClick={handleActivatePlan}
                className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium underline"
              >
                Start 12-Week Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Progression Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Movement Safety & 12-Week Plan
              </h3>
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

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
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Stop Signals — Cease Exercise Immediately:</h4>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
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
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">12-Week Progression Structure:</h4>
              <div className="space-y-2">
                {PROGRESSION_PHASES.map((phase, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-slate-100 font-bold">{phase.phase}</strong>
                      <span className="text-teal-700 dark:text-teal-300 font-semibold">{phase.targetSets}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{phase.guidance}</p>
                    <p className="text-amber-800 dark:text-amber-400 font-medium">⚠️ {phase.caution}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Health Notes */}
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-teal-50/50 dark:bg-teal-950/30 p-3 rounded-lg border border-teal-100 dark:border-teal-900/40">
              <p className="font-semibold text-teal-900 dark:text-teal-200">General Recovery Guidance:</p>
              <ul className="list-disc pl-4 space-y-1 text-teal-950 dark:text-teal-300">
                {GENERAL_HEALTH_NOTES.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(MovementCard);
