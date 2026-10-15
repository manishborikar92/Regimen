'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { BookMarked, Check, Clock, Moon, Play, Pause, RotateCcw } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

function ReadingCard({ habit, isCompleted, onToggle, progress = {}, onUpdateProgress }) {
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60); // 30 minutes
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
    setSecondsRemaining(30 * 60);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
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

        {/* 30-Minute Timer Box (Mobile-Optimized Layout) */}
        <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-2xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                30-Min Target
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
                {timeFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleStartTimer}
              className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs ${
                timerActive
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {timerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> <span>Start Timer</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleResetTimer}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReadingCard);
