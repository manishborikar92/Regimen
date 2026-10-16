'use client';

import { memo } from 'react';
import { BookMarked, Check, Clock, Moon, Play, Pause, RotateCcw } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { getTimingDisplay } from '@/utils/date-helpers';
import { useTimer } from '@/hooks/use-timer';
import { useSound } from '@/contexts';
import { getReadingTargetMinutes } from '@/utils/reading-helpers';

/**
 * ReadingCard — Specialized reading & focus timer card.
 *
 * Implements:
 * - Authoritative duration configured via HabitModal (15-60 min)
 * - Background-resilient countdown using absolute end timestamps (immune to tab throttling)
 * - Navigation & page reload persistence (survives route switches and refreshes)
 * - Gentle Web Audio API harmonic completion chime
 * - Non-intrusive HTML5 browser notifications on background completion
 * - Granular duration progress recording to Firestore daily logs
 * - WCAG 2.2 compliant touch targets and zero prohibited colors
 */
function ReadingCard({ habit, isCompleted, onToggle, progress = {}, onUpdateProgress }) {
  const { playStepToggleCue, playHabitCompleteCue } = useSound();
  const config = getCategoryConfig(habit.category);
  const timingText = getTimingDisplay(habit);
  const isNightTiming = timingText.toLowerCase().includes('bed') || timingText.toLowerCase().includes('night');

  const targetMinutes = getReadingTargetMinutes(habit);

  const {
    targetSeconds,
    secondsRemaining,
    timerActive,
    isPaused,
    progressPercent,
    timeFormatted,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer({
    habitId: habit.id,
    initialTargetMinutes: targetMinutes,
    isCompleted,
    onComplete: ({ durationMinutes }) => {
      if (onUpdateProgress) {
        onUpdateProgress(habit.id, { durationMinutes }, true);
      } else if (!isCompleted && onToggle) {
        onToggle(habit.id);
      }
    },
  });

  const handleStartTimer = () => {
    if (timerActive) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
        isCompleted
          ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 border-t-emerald-500 dark:border-t-emerald-400'
          : 'border-subtle border-t-emerald-500 dark:border-t-emerald-400'
      }`}
    >
      <div className="p-3.5 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-2xs sm:text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded-md font-medium">
                {isNightTiming ? (
                  <Moon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                ) : (
                  <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                )}
                {timingText}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{habit.title}</span>
            </h3>

            <p className="text-xs text-sub mt-0.5 leading-relaxed">
              {targetMinutes} minutes target • {habit.instructions || 'Read before sleep'}
            </p>
          </div>

          {/* Quick Completion Button */}
          <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => {
                if (!isCompleted) {
                  playHabitCompleteCue?.();
                } else {
                  playStepToggleCue?.(false);
                }
                onToggle?.(habit.id);
              }}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-stone-300 dark:border-stone-600 hover:border-emerald-500 text-transparent'
              }`}
              aria-label={isCompleted ? 'Mark reading incomplete' : 'Mark reading complete'}
            >
              {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Dynamic Timer Panel (Structured Mobile-First Layout) */}
        <div className="mt-3 p-3 sm:p-3.5 bg-surface-subtle dark:bg-slate-900/40 rounded-xl border border-subtle space-y-2.5">
          {/* Header Row: Target duration & State badge */}
          <div className="flex items-center justify-between text-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-muted uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{targetMinutes}-Min Target</span>
            </div>

            <div className="flex items-center gap-2">
              {progressPercent > 0 && (
                <span className="font-mono text-2xs text-muted font-medium">
                  {progressPercent}%
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-2xs font-medium border transition-colors ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : timerActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : isPaused || secondsRemaining < targetSeconds
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-surface text-muted border-subtle'
                }`}
              >
                {isCompleted ? 'Completed' : timerActive ? 'Active' : (isPaused || secondsRemaining < targetSeconds) ? 'Paused' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Time Display and Actions Row */}
          <div className="flex items-center justify-between gap-2.5 pt-0.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-xl sm:text-2xl font-mono font-bold text-main tracking-tight">
                {timeFormatted}
              </span>
              <span className="text-2xs text-muted font-medium truncate">
                {timerActive ? 'remaining' : (isPaused || secondsRemaining < targetSeconds) ? 'paused' : 'target'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleStartTimer}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap shadow-2xs ${
                  timerActive
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/80 dark:border-amber-800/80'
                    : 'bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500'
                }`}
              >
                {timerActive ? (
                  <>
                    <Pause className="w-4 h-4" /> <span>Pause</span>
                  </>
                ) : isPaused || secondsRemaining < targetSeconds ? (
                  <>
                    <Play className="w-4 h-4 fill-current" /> <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                disabled={secondsRemaining === targetSeconds && !timerActive}
                className="w-11 h-11 rounded-xl text-muted hover:text-main bg-surface border border-subtle hover:bg-surface-subtle flex items-center justify-center transition-colors disabled:opacity-35 disabled:hover:bg-surface disabled:hover:text-muted"
                title="Reset Timer"
                aria-label="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReadingCard);
