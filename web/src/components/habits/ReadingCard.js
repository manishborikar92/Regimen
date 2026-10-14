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
      className={`relative rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'bg-emerald-50/20 border-emerald-200' : ''
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1.5 w-full rounded-t-xl bg-gradient-to-r from-emerald-500 to-teal-500 ${
          isCompleted ? 'opacity-80' : 'opacity-40'
        }`}
      />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-medium">
                <Moon className="w-3 h-3 text-indigo-600" />
                Before bed (Relative timing)
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                30 Minutes Target
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              {habit.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Read 30 minutes before sleep. Completing directly or using the optional timer both work.
            </p>
          </div>

          {/* Quick Completion Button */}
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-gray-300 hover:border-emerald-500 text-transparent'
            }`}
            aria-label={isCompleted ? 'Mark reading incomplete' : 'Mark reading complete'}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Optional 30-Minute Timer Box */}
        <div className="mt-4 p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-xs text-gray-500 block">Optional 30-Min Reading Timer</span>
              <span className="text-sm font-mono font-bold text-gray-900">{timeFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleStartTimer}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                timerActive
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {timerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Timer
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleResetTimer}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReadingCard);
