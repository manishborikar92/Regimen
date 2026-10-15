'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { BookMarked, Check, Clock, Moon, Play, Pause, RotateCcw } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

const TARGET_SECONDS = 30 * 60; // 30 minutes

function ReadingCard({ habit, isCompleted, onToggle, progress = {}, onUpdateProgress }) {
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(TARGET_SECONDS);
  const timerRef = useRef(null);

  const config = getCategoryConfig(habit.category);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartTimer = () => {
    if (timerActive) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    } else {
      setTimerActive(true);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            // Auto complete on timer finish
            if (!isCompleted) {
              onToggle(habit.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleResetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
    setSecondsRemaining(TARGET_SECONDS);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const elapsedSeconds = TARGET_SECONDS - secondsRemaining;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / TARGET_SECONDS) * 100)));

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
                <Moon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                Before Bed
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{habit.title}</span>
            </h3>

            <p className="text-xs text-sub mt-0.5 leading-relaxed">
              30 minutes target • Read before sleep
            </p>
          </div>

          {/* Quick Completion Button */}
          <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => onToggle(habit.id)}
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

        {/* 30-Minute Timer Panel (Structured Mobile-First Layout) */}
        <div className="mt-3 p-3 sm:p-3.5 bg-surface-subtle dark:bg-slate-900/40 rounded-xl border border-subtle space-y-2.5">
          {/* Header Row: Target duration & State badge */}
          <div className="flex items-center justify-between text-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-muted uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>30-Min Target</span>
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
                    : secondsRemaining < TARGET_SECONDS
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-surface text-muted border-subtle'
                }`}
              >
                {isCompleted ? 'Completed' : timerActive ? 'Active' : secondsRemaining < TARGET_SECONDS ? 'Paused' : 'Ready'}
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
                {timerActive ? 'remaining' : secondsRemaining < TARGET_SECONDS ? 'paused' : 'target'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleStartTimer}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap shadow-2xs ${
                  timerActive
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300/80 dark:border-amber-800/80'
                    : secondsRemaining < TARGET_SECONDS
                    ? 'bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500'
                    : 'bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500'
                }`}
              >
                {timerActive ? (
                  <>
                    <Pause className="w-4 h-4" /> <span>Pause</span>
                  </>
                ) : secondsRemaining < TARGET_SECONDS ? (
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
                disabled={secondsRemaining === TARGET_SECONDS && !timerActive}
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
