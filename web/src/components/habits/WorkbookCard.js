'use client';

import { useState, memo } from 'react';
import { BookOpen, Check, CheckCircle2, ChevronDown, Clock, Info } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

/**
 * WorkbookCard: Dedicated 2-session English Workbook Tracker.
 * 
 * Requirements:
 * - Word Power Made Easy context.
 * - 0/2, 1/2, 2/2 session progress counter.
 * - Separate toggle for reviewing previous day's notes.
 * - Separate toggle for uninterrupted session indicator.
 * - Does not collapse into a single opaque checkbox.
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
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-sm transition-all duration-200 hover:shadow-md ${
        isFullyComplete
          ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/80 border-t-teal-600 dark:border-t-teal-400'
          : 'border-subtle border-t-teal-600 dark:border-t-teal-400'
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
              <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800/60">
                {habit.metadata?.bookTitle || 'Workbook'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-700 dark:text-teal-400 flex-shrink-0" />
              {habit.title}
            </h3>

            <p className="text-xs sm:text-sm text-sub mt-1">
              Complete 2 daily workbook sessions. Review previous notes before starting.
            </p>
          </div>

          {/* Overall status badge */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isFullyComplete
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : sessions > 0 || reviewDone
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isFullyComplete ? 'Completed' : sessions > 0 ? 'In Progress' : 'Not Started'}
            </span>
          </div>
        </div>

        {/* Dedicated Progress Section */}
        <div className="mt-4 p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          {/* Session Progress Stepper */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Daily Sessions
              </span>
              <p className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200 mt-0.5">
                {sessions} / 2 sessions completed
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-subtle shadow-2xs">
              <button
                type="button"
                onClick={() => handleSessionChange(sessions - 1)}
                disabled={sessions <= 0}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                aria-label="Decrease session count"
              >
                -
              </button>
              <div className="w-12 text-center font-bold text-teal-700 dark:text-teal-300 text-sm">
                {sessions} / 2
              </div>
              <button
                type="button"
                onClick={() => handleSessionChange(sessions + 1)}
                disabled={sessions >= 2}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-md flex items-center justify-center bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                aria-label="Increase session count"
              >
                +
              </button>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                sessions === 2 ? 'bg-emerald-500' : 'bg-teal-600 dark:bg-teal-500'
              }`}
              style={{ width: `${(sessions / 2) * 100}%` }}
            />
          </div>

          {/* Condition Checkboxes */}
          <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            {/* Condition 1: Review previous work */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 select-none">
              <input
                type="checkbox"
                checked={reviewDone}
                onChange={handleToggleReview}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="flex-1">
                <strong className="font-semibold text-slate-900 dark:text-slate-100">Previous-work revision:</strong>{' '}
                Reviewed yesterday&apos;s workbook exercises before starting
              </span>
            </label>

            {/* Condition 2: Uninterrupted session indicator */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 select-none">
              <input
                type="checkbox"
                checked={uninterruptedDone}
                onChange={handleToggleUninterrupted}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800"
              />
              <span className="flex-1 text-slate-600 dark:text-slate-400">
                At least one session completed without taking a break (focus indicator)
              </span>
            </label>
          </div>

          {/* Partial progress explanation */}
          {!isFullyComplete && (sessions > 0 || reviewDone) && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1.5 rounded-md border border-amber-200 dark:border-amber-800/50">
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
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">
                Both sessions completed and previous revision fulfilled!
              </span>
            </div>
          )}
        </div>

        {/* Instructions Toggle */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
            aria-expanded={isExpanded}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            {isExpanded ? 'Hide Study Guidelines' : 'Show Study Guidelines'}
          </button>

          {isExpanded && (
            <div className="mt-2 p-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-teal-100 dark:border-teal-900/40">
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
