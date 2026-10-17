'use client';

import { useState, useMemo, memo } from 'react';
import {
  Check,
  Clock,
  Moon,
  ChevronDown,
  MoreVertical,
  SkipForward,
  XCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import {
  evaluateHabitCompletion,
  clampCounterProgress,
  deriveCompletedProgressForHabit,
  deriveUncompletedProgressForHabit,
} from '@/lib/constants/habit-models';
import { getTimingDisplay } from '@/utils/date-helpers';
import { useSound } from '@/contexts';
import {
  SlotTimer,
  SlotStepper,
  SlotChecklist,
  SlotNotes,
  SlotCatalog,
  SlotDaySchedule,
} from './slots';

/**
 * DashboardHabitCard — Unified Composable Habit Card for the Vritta Dashboard.
 * Phase 3: Universal Habit Card System
 *
 * Implements:
 * - Feature-driven architecture rendering atomic slots dynamically based on `habit.features`.
 * - Strictly NO title sniffing, account hardcoding, or category substring matching.
 * - Category styling tokens derived from authoritative 9 canonical categories.
 * - WCAG 2.2 AA/AAA compliant touch targets (min 44x44px) for all primary actions.
 * - Collapsible instructions accordion addressing Gate 0 mobile card density.
 * - "Skip / Rest Today" and "Mark Missed" action menu for outcome tracking.
 * - Seamless preservation of Osho listening, reading timers, workbook steppers, and conditioning plans.
 */
function DashboardHabitCard({
  habit,
  isCompleted = false,
  progress = {},
  outcome = null,
  onToggle,
  onUpdateProgress,
  onSetOutcome,
  userProfile = {},
  onUpdateProfile,
}) {
  const { playStepToggleCue, playHabitCompleteCue } = useSound();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  if (!habit) return null;

  const config = getCategoryConfig(habit.category, habit.customCategory);
  const timingText = getTimingDisplay(habit);
  const isNightTiming = timingText.toLowerCase().includes('bed') || timingText.toLowerCase().includes('night');

  // Normalize features from canonical composable habit model or backward-compatible feature inference
  const features = habit.features || {};

  const hasCounter = Boolean(
    features.counter?.enabled ||
    habit.completionMethod === 'workbook_sessions' ||
    habit.stableKey === 'canonical_english_workbook'
  );

  const hasTimer = Boolean(
    features.timer?.enabled ?? (
      habit.completionMethod === 'reading_duration' ||
      habit.stableKey === 'canonical_read_books'
    )
  );

  const hasChecklist = Boolean(
    features.checklist?.enabled ||
    (Array.isArray(habit.checklistItems) && habit.checklistItems.length > 0) ||
    habit.completionMethod === 'checklist' ||
    (habit.completionMethod === 'workbook_sessions')
  );

  const hasNotes = Boolean(
    features.notes?.enabled ||
    habit.completionMethod === 'simple_with_notes' ||
    habit.completionMethod === 'diary_entry' ||
    habit.stableKey === 'canonical_english_speaking' ||
    habit.stableKey === 'canonical_maintain_diary'
  );

  const hasCatalog = Boolean(
    features.catalog?.enabled ||
    habit.completionMethod === 'osho_listening' ||
    habit.stableKey === 'canonical_listen_osho'
  );

  const hasDaySchedule = Boolean(
    features.daySchedule?.enabled ||
    habit.completionMethod === 'exercise_plan' ||
    habit.stableKey === 'canonical_exercise_plan'
  );

  // Resolved outcome status: 'completed' | 'skipped' | 'missed'
  const isSkipped = outcome === 'skipped';
  const isMissed = outcome === 'missed';

  // Card effective completion state
  const isEffectivelyCompleted = isCompleted && !isSkipped && !isMissed;

  // Instructions text
  const instructionsText = habit.instructions || habit.description || '';
  const hasLongInstructions = instructionsText.length > 60;

  // Primary completion button toggle
  const handlePrimaryToggle = (e) => {
    e.stopPropagation();
    setShowActionMenu(false);

    if (isEffectivelyCompleted) {
      playStepToggleCue?.(false);
      const nextProgress = deriveUncompletedProgressForHabit(habit, progress);
      onUpdateProgress?.(habit.id, nextProgress, false);
      if (outcome) {
        onSetOutcome?.(habit.id, null);
      } else {
        onToggle?.(habit.id);
      }
    } else {
      playHabitCompleteCue?.();
      const nextProgress = deriveCompletedProgressForHabit(habit, progress);
      onUpdateProgress?.(habit.id, nextProgress, true);
      if (outcome) {
        onSetOutcome?.(habit.id, 'completed');
      } else {
        onToggle?.(habit.id);
      }
    }
  };

  // Outcome setters
  const handleSetOutcome = (newOutcome, e) => {
    e.stopPropagation();
    setShowActionMenu(false);
    onSetOutcome?.(habit.id, newOutcome);
  };

  // Slot update handlers with strict completion boundaries
  const handleCounterChange = (newCount) => {
    const clampedCount = clampCounterProgress(habit, newCount);
    const nextProgress = {
      ...progress,
      sessionsCompleted: clampedCount,
      count: clampedCount,
    };
    const allFeaturesSatisfied = evaluateHabitCompletion(habit, nextProgress);
    // Invariant: Skipped/missed parent outcomes must NOT be silently overwritten by item updates
    const completionFlag = (isSkipped || isMissed) ? undefined : allFeaturesSatisfied;
    onUpdateProgress?.(habit.id, nextProgress, completionFlag);
  };

  const handleTimerComplete = ({ durationMinutes }) => {
    const nextProgress = {
      ...progress,
      durationMinutes,
      timerCompleted: true,
    };
    const allFeaturesSatisfied = evaluateHabitCompletion(habit, nextProgress);
    const completionFlag = (isSkipped || isMissed) ? undefined : allFeaturesSatisfied;
    onUpdateProgress?.(habit.id, nextProgress, completionFlag);
  };

  const handleChecklistChange = (nextSteps, allDone) => {
    const nextProgress = {
      ...progress,
      completedSteps: nextSteps,
      reviewDone: allDone,
    };
    const allFeaturesSatisfied = evaluateHabitCompletion(habit, nextProgress);
    const completionFlag = (isSkipped || isMissed) ? undefined : allFeaturesSatisfied;
    onUpdateProgress?.(habit.id, nextProgress, completionFlag);
  };

  const handleDayScheduleChange = (updatedItemIds, allDone) => {
    const nextProgress = {
      ...progress,
      completedItemIds: updatedItemIds,
      workoutCompleted: allDone,
      walkCompleted: allDone,
    };
    const allFeaturesSatisfied = evaluateHabitCompletion(habit, nextProgress);
    const completionFlag = (isSkipped || isMissed) ? undefined : allFeaturesSatisfied;
    onUpdateProgress?.(habit.id, nextProgress, completionFlag);
  };

  const handleCatalogChange = (catalogUpdates) => {
    const nextProgress = {
      ...progress,
      ...catalogUpdates,
    };
    const allFeaturesSatisfied = evaluateHabitCompletion(habit, nextProgress);
    const completionFlag = (isSkipped || isMissed) ? undefined : allFeaturesSatisfied;
    onUpdateProgress?.(habit.id, nextProgress, completionFlag);
  };

  const handleNotesSave = (notesText) => {
    // Notes is an expressive journal feature; it NEVER alters habit completion state
    onUpdateProgress?.(habit.id, {
      ...progress,
      notes: notesText,
      diaryEntry: notesText,
    });
  };

  return (
    <div
      className={`relative rounded-2xl border border-t-[3px] bg-surface shadow-2xs transition-all duration-200 hover:shadow-xs ${
        config.borderTopColor || 'border-t-teal-600 dark:border-t-teal-400'
      } ${
        isEffectivelyCompleted
          ? 'bg-teal-50/20 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-900/60'
          : isSkipped
          ? 'bg-slate-50/50 dark:bg-stone-900/40 border-dashed border-subtle opacity-75'
          : isMissed
          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/50'
          : 'border-subtle'
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Header Row: Category Badge & Timing on Left, Action Menu & Checkbox on Right */}
        <div className="flex items-start justify-between gap-3">
          {/* Left Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5">
              <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border ${config.badgeClasses}`}>
                {config.label || habit.category}
              </span>

              {timingText && (
                <span className="flex items-center gap-1 text-2xs sm:text-xs text-sub bg-surface-subtle border border-subtle px-2 py-0.5 rounded-md font-medium">
                  {isNightTiming ? (
                    <Moon className="w-3 h-3 text-slate-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{timingText}</span>
                </span>
              )}

              {isSkipped && (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  Skipped / Rest
                </span>
              )}

              {isMissed && (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                  Missed
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-main leading-snug">
              {habit.title}
            </h3>

            {/* Collapsible Instructions (Addresses Gate 0 Density finding) */}
            {instructionsText && (
              <div className="mt-1">
                {hasLongInstructions ? (
                  <div>
                    {showInstructions ? (
                      <p className="text-xs sm:text-sm text-sub whitespace-pre-line leading-relaxed">
                        {instructionsText}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-sub line-clamp-1 leading-relaxed">
                        {instructionsText}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowInstructions(prev => !prev)}
                      className="text-2xs font-semibold text-teal-700 dark:text-teal-400 hover:underline mt-0.5 inline-flex items-center gap-0.5"
                    >
                      {showInstructions ? 'Hide instructions' : 'Show full instructions'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-sub leading-relaxed">
                    {instructionsText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Action Controls: Action Menu & Primary Circular Completion Checkmark */}
          <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
            {/* Outcome Action Menu (Skip / Missed) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActionMenu(prev => !prev)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-slate-400 hover:text-main hover:bg-surface-subtle flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label="More actions"
                title="Habit options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActionMenu && (
                <div
                  className="absolute right-0 top-11 z-30 w-44 bg-surface rounded-xl border border-subtle shadow-lg py-1 text-xs animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleSetOutcome('skipped', e)}
                    className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2 text-main"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                    <span>Skip / Rest Today</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSetOutcome('missed', e)}
                    className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2 text-rose-600 dark:text-rose-400"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Mark as Missed</span>
                  </button>
                  {(isSkipped || isMissed) && (
                    <button
                      type="button"
                      onClick={(e) => handleSetOutcome(null, e)}
                      className="w-full px-3 py-2 text-left hover:bg-surface-subtle flex items-center gap-2 text-sub border-t border-subtle"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Outcome</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Primary Circular Completion Button (WCAG min 44x44px touch target) */}
            <button
              type="button"
              onClick={handlePrimaryToggle}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 active:scale-95 ${
                isEffectivelyCompleted
                  ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-600 text-white shadow-teal-700/20 shadow-xs'
                  : 'border-slate-300 dark:border-stone-600 hover:border-teal-500 bg-surface'
              }`}
              aria-label={isEffectivelyCompleted ? `Mark ${habit.title} incomplete` : `Mark ${habit.title} complete`}
              title={isEffectivelyCompleted ? 'Completed' : 'Mark completed'}
            >
              {isEffectivelyCompleted && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* ATOMIC FEATURE SLOTS (Conditioned strictly on features) */}
        <div className="space-y-3 pt-0.5">
          {/* 1. Counter Slot */}
          {hasCounter && (
            <SlotStepper
              feature={features.counter || { targetCount: 2, unit: 'sessions', step: 1, minCount: 0 }}
              progress={progress}
              onChange={handleCounterChange}
              disabled={isSkipped || isMissed}
              isHabitComplete={isEffectivelyCompleted}
            />
          )}

          {/* 2. Timer Slot */}
          {hasTimer && (
            <SlotTimer
              habitId={habit.id}
              feature={features.timer || { targetDurationMinutes: habit.targetMinutes || 30 }}
              habit={habit}
              isCompleted={isEffectivelyCompleted}
              onComplete={handleTimerComplete}
            />
          )}

          {/* 3. Checklist Slot */}
          {hasChecklist && (
            <SlotChecklist
              feature={features.checklist || { items: habit.checklistItems || [] }}
              habit={habit}
              progress={progress}
              onChange={handleChecklistChange}
              disabled={isSkipped || isMissed}
              isHabitComplete={isEffectivelyCompleted}
            />
          )}

          {/* 4. Day Schedule & Conditioning Slot */}
          {hasDaySchedule && (
            <SlotDaySchedule
              feature={features.daySchedule || {}}
              habit={habit}
              progress={progress}
              onChange={handleDayScheduleChange}
              userProfile={userProfile}
              onUpdateProfile={onUpdateProfile}
              disabled={isSkipped || isMissed}
              isHabitComplete={isEffectivelyCompleted}
            />
          )}

          {/* 5. Catalog Slot (Osho Audio Library or Curriculum) */}
          {hasCatalog && (
            <SlotCatalog
              feature={features.catalog || { catalogId: 'osho_discourses', catalogTitle: 'Osho Discourse Audio Library' }}
              habit={habit}
              progress={progress}
              onChange={handleCatalogChange}
              userProfile={userProfile}
              onUpdateProfile={onUpdateProfile}
              disabled={isSkipped || isMissed}
            />
          )}

          {/* 6. Notes & Reflection Slot */}
          {hasNotes && (
            <SlotNotes
              habitId={habit.id}
              feature={features.notes || { isPrivateDiary: habit.completionMethod === 'diary_entry' }}
              progress={progress}
              onSave={handleNotesSave}
              disabled={isSkipped || isMissed}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardHabitCard);
