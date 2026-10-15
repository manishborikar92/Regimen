'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MessageSquare, Check, Clock, Bot, PenLine } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

function SpeakingCard({ habit, isCompleted, onToggle, progress = {}, onUpdateProgress }) {
  const [showNotes, setShowNotes] = useState(Boolean(progress.notes));
  const [notes, setNotes] = useState(progress.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [prevProgressNotes, setPrevProgressNotes] = useState(progress.notes);

  const config = getCategoryConfig(habit.category);

  // Synchronization and debouncing refs
  const latestNotesRef = useRef(notes);
  const lastSavedNotesRef = useRef(progress.notes || '');
  const latestProgressRef = useRef(progress);
  const isCompletedRef = useRef(isCompleted);
  const timerRef = useRef(null);

  // Synchronize incoming external notes during render when not actively editing
  if (!isEditing && progress.notes !== prevProgressNotes) {
    setPrevProgressNotes(progress.notes);
    setNotes(progress.notes || '');
  }

  // Keep refs synchronized in effects
  useEffect(() => {
    latestNotesRef.current = notes;
    latestProgressRef.current = progress;
    isCompletedRef.current = isCompleted;
  }, [notes, progress, isCompleted]);

  // Flush pending changes immediately
  const flushSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsEditing(false);

    if (latestNotesRef.current !== lastSavedNotesRef.current) {
      const textToSave = latestNotesRef.current;
      lastSavedNotesRef.current = textToSave;

      try {
        onUpdateProgress(habit.id, {
          ...latestProgressRef.current,
          notes: textToSave,
        }, isCompletedRef.current);
      } catch (err) {
        console.error('Error saving speaking notes:', err);
      }
    }
  }, [habit.id, onUpdateProgress]);

  // Debounced input change (~400ms)
  const handleNotesChange = (text) => {
    setNotes(text);
    latestNotesRef.current = text;
    setIsEditing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      flushSave();
    }, 400);
  };

  // Immediate save on blur
  const handleBlur = () => {
    flushSave();
  };

  // Flush pending save if completion toggle is clicked
  const handleToggle = () => {
    flushSave();
    onToggle(habit.id);
  };

  // Immediate flush on unmount (e.g. client-side page navigation or activity unmount)
  useEffect(() => {
    return () => {
      flushSave();
    };
  }, [flushSave]);

  // Immediate flush on tab switch or page unload
  useEffect(() => {
    const handleVisibilityOrUnload = () => {
      flushSave();
    };

    window.addEventListener('visibilitychange', handleVisibilityOrUnload);
    window.addEventListener('beforeunload', handleVisibilityOrUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrUnload);
      window.removeEventListener('beforeunload', handleVisibilityOrUnload);
    };
  }, [flushSave]);

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? 'bg-sky-50/20 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/80 border-t-sky-500 dark:border-t-sky-400'
          : 'border-subtle border-t-sky-500 dark:border-t-sky-400'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-sub bg-surface-subtle px-2 py-0.5 rounded-md border border-subtle">
                <Clock className="w-3 h-3 text-slate-400" />
                Anytime
              </span>
              <span className="flex items-center gap-1 text-xs text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60 font-medium">
                <Bot className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                ChatGPT Conversation
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              {habit.title}
            </h3>

            <p className="text-xs sm:text-sm text-sub mt-1">
              Practise speaking English with ChatGPT voice. Flexible duration—focus on natural conversation.
            </p>
          </div>

          {/* Quick Completion Button */}
          <button
            type="button"
            onClick={handleToggle}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-600 hover:border-sky-500 text-transparent'
            }`}
            aria-label={isCompleted ? 'Mark speaking incomplete' : 'Mark speaking complete'}
          >
            {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
          </button>
        </div>

        {/* Optional Notes Toggle */}
        <div className="mt-3 pt-2 border-t border-subtle">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 min-h-[36px] py-1.5 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            {showNotes ? 'Hide conversation notes' : 'Add conversation topics / notes (optional)'}
          </button>

          {showNotes && (
            <div className="mt-2 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="What topics did you talk about today? Any new phrases or pronunciation points learned?"
                rows={2}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-base sm:text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-slate-400 transition-colors"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SpeakingCard);
