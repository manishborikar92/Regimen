'use client';

import { useState, memo } from 'react';
import { BookOpen, Check, CheckCircle2, ChevronDown, Clock, Info } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

/**
 * WorkbookCard: Dedicated 2-session English Workbook Tracker.
 * 
 * Requirements:
 * - Word Power Made Easy context.
 * - 0/2, 1/2, 2/2 session progress counter with >= 44x44px touch targets.
 * - Separate toggle for reviewing previous day's notes.
 * - Separate toggle for uninterrupted session indicator.
 * - Single-line header metadata preventing multi-row badge wrapping on mobile.
 * - Partial completion state explicitly explains what remains.
 */
function WorkbookCard({ habit, isCompleted, progress = {}, onUpdateProgress }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = getCategoryConfig(habit.category);

  // Extract granular progress from log or default to 0
  const sessions = progress.sessionsCompleted || 0;
  const reviewDone = Boolean(progress.reviewDone);
  const uninterruptedDone = Boolean(progress.uninterruptedDone);

  // Full completion requires both sessions (2/2) AND the review check
  const isFullyComplete = sessions >= 2 && reviewDone;

  const handleSessionChange = (newCount) => {
    const clamped = Math.max(0, Math.min(2, newCount));
    const nextFullyComplete = clamped >= 2 && reviewDone;
    onUpdateProgress(habit.id, {
      ...progress,
      sessionsCompleted: clamped,
      reviewDone,
      uninterruptedDone,
    }, nextFullyComplete);
  };

  const handleToggleReview = () => {
    const nextReview = !reviewDone;
    const nextFullyComplete = sessions >= 2 && nextReview;
    onUpdateProgress(habit.id, {
      ...progress,
      sessionsCompleted: sessions,
      reviewDone: nextReview,
      uninterruptedDone,
    }, nextFullyComplete);
  };

  const handleToggleUninterrupted = () => {
    const nextUninterrupted = !uninterruptedDone;
    onUpdateProgress(habit.id, {
      ...progress,
      sessionsCompleted: sessions,
      reviewDone,
      uninterruptedDone: nextUninterrupted,
    }, isFullyComplete);
  };

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
        isFullyComplete
          ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80 border-t-teal-600 dark:border-t-teal-400'
          : 'border-subtle border-t-teal-600 dark:border-t-teal-400'
      }`}
    >
      <div className="p-3.5 sm:p-5">
        {/* Header Metadata Row: Category on left, Status badge on right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
              {habit.category}
            </span>
            <span className="text-2xs sm:text-xs text-teal-800 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60 truncate max-w-[170px] sm:max-w-none">
              {habit.metadata?.bookTitle || 'Word Power Made Easy'}
            </span>
          </div>

          <span
            className={`text-2xs sm:text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              isFullyComplete
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : sessions > 0 || reviewDone
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
            }`}
          >
            {isFullyComplete ? 'Completed' : sessions > 0 ? 'In Progress' : 'Not Started'}
          </span>
        </div>

        {/* Title and Concise Context */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
            <span>{habit.title}</span>
          </h3>
          <p className="text-xs text-sub mt-0.5 leading-relaxed">
            2 daily sessions • Review previous notes before starting
          </p>
        </div>

        {/* Dedicated Progress Section */}
        <div className="mt-3 p-3 sm:p-3.5 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200/70 dark:border-stone-800/70 space-y-3">
          {/* Stepper Row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-2xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                Daily Sessions
              </span>
              <p className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                {sessions} / 2 sessions completed
              </p>
            </div>

            {/* Stepper Buttons (Upgraded to WCAG 2.2 AAA min 44x44px) */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-subtle shadow-2xs">
              <button
                type="button"
                onClick={() => handleSessionChange(sessions - 1)}
                disabled={sessions <= 0}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                aria-label="Decrease session count"
              >
                -
              </button>
              <div className="w-10 text-center font-bold text-teal-700 dark:text-teal-300 text-sm">
                {sessions} / 2
              </div>
              <button
                type="button"
                onClick={() => handleSessionChange(sessions + 1)}
                disabled={sessions >= 2}
                className="w-11 h-11 rounded-lg flex items-center justify-center bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold shadow-2xs"
                aria-label="Increase session count"
              >
                +
              </button>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                sessions === 2 ? 'bg-emerald-500' : 'bg-teal-600 dark:bg-teal-500'
              }`}
              style={{ width: `${(sessions / 2) * 100}%` }}
            />
          </div>

          {/* Condition Checkboxes with Accessible Touch Targets */}
          <div className="space-y-1 pt-1 border-t border-stone-200/60 dark:border-stone-800/60">
            {/* Condition 1: Review previous work */}
            <label className="flex items-start gap-2.5 cursor-pointer p-1.5 -mx-1.5 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors text-xs sm:text-sm text-stone-700 dark:text-stone-300 select-none">
              <input
                type="checkbox"
                checked={reviewDone}
                onChange={handleToggleReview}
                className="mt-0.5 w-4.5 h-4.5 rounded text-teal-600 focus:ring-teal-500 border-stone-300 dark:border-stone-600 dark:bg-stone-800"
              />
              <span className="flex-1 leading-snug">
                <strong className="font-semibold text-stone-900 dark:text-stone-100">Previous-work revision:</strong>{' '}
                Reviewed yesterday&apos;s workbook exercises
              </span>
            </label>

            {/* Condition 2: Uninterrupted session indicator */}
            <label className="flex items-start gap-2.5 cursor-pointer p-1.5 -mx-1.5 rounded-lg hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors text-xs sm:text-sm text-stone-600 dark:text-stone-400 select-none">
              <input
                type="checkbox"
                checked={uninterruptedDone}
                onChange={handleToggleUninterrupted}
                className="mt-0.5 w-4.5 h-4.5 rounded text-teal-600 focus:ring-teal-500 border-stone-300 dark:border-stone-600 dark:bg-stone-800"
              />
              <span className="flex-1 leading-snug">
                At least one session completed without interruption (focus indicator)
              </span>
            </label>
          </div>

          {/* Partial progress explanation */}
          {!isFullyComplete && (sessions > 0 || reviewDone) && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {sessions < 2 && !reviewDone
                  ? `Need ${2 - sessions} more session(s) and previous-day revision.`
                  : sessions < 2
                  ? `Need ${2 - sessions} more session to reach daily target.`
                  : 'Session target met! Please review previous day\'s work to complete.'}
              </span>
            </div>
          )}

          {isFullyComplete && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">
                Both sessions completed and previous revision fulfilled!
              </span>
            </div>
          )}
        </div>

        {/* Study Guidelines Collapsible Toggle */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
            aria-expanded={isExpanded}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            <span>{isExpanded ? 'Hide Study Guidelines' : 'Show Study Guidelines'}</span>
          </button>

          {isExpanded && (
            <div className="mt-1 p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-lg text-xs text-stone-600 dark:text-stone-300 space-y-1.5 border border-teal-100 dark:border-teal-900/40">
              <p className="font-semibold text-teal-950 dark:text-teal-200">Core Workbook Principles:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Say words and roots aloud to train pronunciation and auditory memory.</li>
                <li>Write down exercises in the book — do not just read passively.</li>
                <li>When starting a session, spend 3–5 minutes recalling key roots from yesterday.</li>
                <li>On Day 1, checking the review box indicates starting fresh with no prior work.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(WorkbookCard);
