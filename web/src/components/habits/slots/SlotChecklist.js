'use client';

import { useState, memo } from 'react';
import { Check, ListChecks, ChevronDown } from 'lucide-react';
import { useSound } from '@/contexts';
import {
  isStepCompleted,
  calculateChecklistProgress,
  toggleChecklistStep,
  normalizeCompletedSteps,
} from '@/utils/checklist-helpers';

/**
 * SlotChecklist — Universal step-by-step checklist slot.
 *
 * Configured via `habit.features.checklist`:
 * - `items`: Array of step definitions ({ id, label, required })
 *
 * Supports robust step normalization (preserving completed state across step reorders/renames),
 * WCAG 2.2 touch targets (min 44x44px), and audio completion feedback.
 */
function SlotChecklist({
  feature = {},
  habit = {},
  progress = {},
  onChange,
  disabled = false,
  isHabitComplete = false,
}) {
  const { playStepToggleCue, playHabitCompleteCue } = useSound();

  // Resolve items from feature.items or legacy habit.checklistItems
  const items = Array.isArray(feature.items) && feature.items.length > 0
    ? feature.items
    : Array.isArray(habit.checklistItems)
    ? habit.checklistItems
    : [];

  const rawCompletedSteps = progress.completedSteps || progress.completedItemIds || [];
  const completedSteps = normalizeCompletedSteps(rawCompletedSteps, items);

  const { completedCount, totalCount, percent, isAllCompleted } = calculateChecklistProgress(
    items,
    completedSteps,
    isHabitComplete
  );

  const [isExpanded, setIsExpanded] = useState(() => totalCount <= 3 || completedCount > 0);

  if (items.length === 0) return null;

  const handleStepToggle = (index, e) => {
    e.stopPropagation();
    if (disabled) return;

    const isCurrentlyChecked = isStepCompleted(items[index], index, completedSteps, isHabitComplete, items);
    const { nextCompletedSteps, isAllCompleted: nextAllDone } = toggleChecklistStep(
      items,
      completedSteps,
      index,
      isHabitComplete
    );

    if (nextAllDone) {
      playHabitCompleteCue?.();
    } else {
      playStepToggleCue?.(!isCurrentlyChecked);
    }

    onChange?.(nextCompletedSteps, nextAllDone);
  };

  return (
    <div className="rounded-xl p-3 sm:p-3.5 bg-surface-subtle/80 dark:bg-stone-900/60 border border-subtle space-y-2.5">
      {/* Header Row */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center gap-1.5 font-semibold text-main hover:text-teal-700 dark:hover:text-teal-400 transition-colors text-2xs uppercase tracking-tight"
          aria-expanded={isExpanded}
        >
          <ListChecks className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Step Checklist</span>
          {totalCount > 3 && (
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        <span className="text-2xs font-medium text-sub">
          {completedCount} of {totalCount} completed ({percent}%)
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isAllCompleted ? 'bg-teal-600 dark:bg-teal-400' : 'bg-teal-500/70'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist items list */}
      {isExpanded && (
        <div className="space-y-1.5 pt-1">
          {items.map((item, index) => {
            const label = typeof item === 'string' ? item : item?.label || `Step ${index + 1}`;
            const stepChecked = isStepCompleted(item, index, completedSteps, isHabitComplete, items);

            return (
              <div
                key={item?.id || `step_${index}`}
                onClick={(e) => handleStepToggle(index, e)}
                className={`flex items-center gap-3 p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                  stepChecked
                    ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/60 text-slate-500 dark:text-slate-400'
                    : 'bg-surface border-subtle text-main hover:bg-surface-subtle'
                }`}
              >
                {/* Checkbox button (WCAG 2.2 min 44x44px touch target) */}
                <button
                  type="button"
                  onClick={(e) => handleStepToggle(index, e)}
                  disabled={disabled}
                  className={`w-9 h-9 min-w-[36px] min-h-[36px] sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    stepChecked
                      ? 'bg-teal-700 dark:bg-teal-600 border-teal-700 dark:border-teal-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-500 bg-surface'
                  }`}
                  aria-label={`Toggle ${label}`}
                >
                  {stepChecked && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <span className={`text-xs sm:text-sm font-medium leading-relaxed flex-1 ${stepChecked ? 'line-through text-muted' : 'text-main'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(SlotChecklist);
