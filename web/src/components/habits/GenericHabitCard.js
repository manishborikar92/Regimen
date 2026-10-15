'use client';

import { useState, memo } from 'react';
import { Check, ChevronDown, Clock, ListChecks } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { getTimingDisplay } from '@/utils/date-helpers';

function GenericHabitCard({ habit, isCompleted, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getCategoryConfig(habit.category);
  const hasChecklist = habit.checklistItems && habit.checklistItems.length > 0;
  const timingText = getTimingDisplay(habit);

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
        isCompleted
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

            <h3 className={`text-base sm:text-lg font-bold text-main ${isCompleted ? 'line-through text-muted' : ''}`}>
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
              onClick={() => onToggle(habit.id)}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                isCompleted
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-stone-300 dark:border-stone-600 hover:border-emerald-500 text-transparent'
              }`}
              aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Expandable Checklist Items */}
        {hasChecklist && (
          <div className="mt-2.5 pt-2 border-t border-subtle">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="min-h-[44px] py-2 flex items-center gap-1.5 text-xs font-semibold text-sub hover:text-main transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isExpanded ? 'Hide items' : `Show ${habit.checklistItems.length} checklist items`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <ul className="mt-1.5 space-y-1.5 text-xs text-sub bg-surface-subtle p-2.5 rounded-lg border border-subtle">
                {habit.checklistItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center text-2xs font-bold">
                      {index + 1}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(GenericHabitCard);
