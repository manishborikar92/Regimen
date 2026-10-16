'use client';

import { useState, memo } from 'react';
import { Check, ChevronDown, Clock, ListChecks } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { getTimingDisplay } from '@/utils/date-helpers';
import { useSound } from '@/contexts';
import {
  getStepId,
  isStepCompleted,
  calculateChecklistProgress,
  toggleChecklistStep,
  toggleAllChecklistSteps,
  normalizeCompletedSteps,
} from '@/utils/checklist-helpers';

function GenericHabitCard({
  habit,
  isCompleted,
  onToggle,
  progress = {},
  onUpdateProgress,
}) {
  const { playStepToggleCue, playHabitCompleteCue } = useSound();
  const config = getCategoryConfig(habit.category);
  const items = Array.isArray(habit.checklistItems) ? habit.checklistItems : [];
  const hasChecklist = items.length > 0;
  const timingText = getTimingDisplay(habit);

  const rawCompletedSteps = progress?.completedSteps || [];
  const completedSteps = normalizeCompletedSteps(rawCompletedSteps, items);
  const { completedCount, totalCount, percent, isAllCompleted } = calculateChecklistProgress(
    items,
    completedSteps,
    isCompleted
  );

  const isEffectivelyCompleted = isCompleted || (hasChecklist && isAllCompleted);
  const [isExpanded, setIsExpanded] = useState(() => !isEffectivelyCompleted && completedCount > 0);

  const handleToggleStep = (index) => {
    if (!onUpdateProgress) {
      return;
    }

    const isCurrentlyChecked = isStepCompleted(items[index], index, completedSteps, isCompleted, items);
    const { nextCompletedSteps, isAllCompleted: nextAllDone } = toggleChecklistStep(
      items,
      completedSteps,
      index,
      isCompleted
    );

    // If final step completes the habit, play only habit completion cue and suppress step tick.
    if (nextAllDone) {
      playHabitCompleteCue?.();
    } else {
      playStepToggleCue?.(!isCurrentlyChecked);
    }

    onUpdateProgress(
      habit.id,
      {
        ...progress,
        completedSteps: nextCompletedSteps,
      },
      nextAllDone
    );
  };

  const handleToggleWholeHabit = () => {
    const nextCompleted = !isEffectivelyCompleted;
    if (nextCompleted) {
      playHabitCompleteCue?.();
    } else {
      playStepToggleCue?.(false);
    }

    if (!hasChecklist || !onUpdateProgress) {
      onToggle(habit.id);
      return;
    }

    const { nextCompletedSteps } = toggleAllChecklistSteps(items, nextCompleted);

    onUpdateProgress(
      habit.id,
      {
        ...progress,
        completedSteps: nextCompletedSteps,
      },
      nextCompleted
    );
  };

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
        isEffectivelyCompleted
          ? `bg-stone-50/70 dark:bg-stone-900/60 opacity-80 border-stone-200 dark:border-stone-800 ${config.borderTopColor || 'border-t-stone-400 dark:border-t-stone-600'}`
          : `border-subtle ${config.borderTopColor || 'border-t-stone-400 dark:border-t-stone-600'}`
      }`}
    >
      <div className="p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-2xs sm:text-xs text-sub bg-surface-subtle px-2 py-0.5 rounded-md border border-subtle">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{timingText}</span>
              </span>
            </div>

            <h3 className={`text-base sm:text-lg font-bold text-main ${isEffectivelyCompleted ? 'line-through text-muted' : ''}`}>
              {habit.title}
            </h3>

            {habit.instructions && (
              <p className="text-xs text-sub mt-0.5 whitespace-pre-line leading-relaxed">
                {habit.instructions}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleToggleWholeHabit}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                isEffectivelyCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-stone-300 dark:border-stone-600 hover:border-emerald-500 text-transparent'
              }`}
              aria-label={isEffectivelyCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isEffectivelyCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Expandable Interactive Checklist Section */}
        {hasChecklist && (
          <div className="mt-3 p-3 sm:p-3.5 bg-surface-subtle dark:bg-slate-900/40 rounded-xl border border-subtle space-y-2.5">
            {/* Header / Summary Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-2xs font-bold text-muted uppercase tracking-wider block">
                  Step Checklist
                </span>
                <p className="text-xs sm:text-sm font-bold text-main mt-0.5">
                  {completedCount} of {totalCount} steps completed
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="py-1 px-2.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1.5 rounded-lg hover:bg-stone-200/50 dark:hover:bg-slate-800/50 transition-colors"
                aria-expanded={isExpanded}
              >
                <ListChecks className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{isExpanded ? 'Hide steps' : `Show ${totalCount} steps`}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 dark:bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Expandable Step List with Accessible Interactive Controls */}
            {isExpanded && (
              <div className="space-y-1.5 pt-1">
                {items.map((item, index) => {
                  const isChecked = isStepCompleted(item, index, completedSteps, isCompleted, items);
                  const stepId = getStepId(item, index);
                  const inputId = `step_${habit.id}_${stepId}`;

                  return (
                    <div
                      key={stepId}
                      onClick={() => handleToggleStep(index)}
                      className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isChecked
                          ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/50 shadow-2xs'
                          : 'bg-surface border-subtle hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="pt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          id={inputId}
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleStep(index);
                          }}
                          className="w-4.5 h-4.5 rounded-md text-teal-600 focus:ring-2 focus:ring-teal-500 border-stone-300 dark:border-stone-600 dark:bg-stone-900 cursor-pointer transition-colors"
                          aria-label={`Mark step ${index + 1}: ${item.label} complete`}
                        />
                      </div>
                      <label
                        htmlFor={inputId}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs sm:text-sm font-medium cursor-pointer leading-snug flex-1 select-none ${
                          isChecked
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <span className="text-2xs font-bold text-muted mr-1.5">{index + 1}.</span>
                        <span>{item.label}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(GenericHabitCard);
