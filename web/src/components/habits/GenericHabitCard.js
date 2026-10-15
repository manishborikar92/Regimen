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
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? `bg-slate-50/70 dark:bg-slate-900/60 opacity-80 border-slate-200 dark:border-slate-800 ${config.borderTopColor || 'border-t-slate-400 dark:border-t-slate-600'}`
          : `border-subtle ${config.borderTopColor || 'border-t-slate-400 dark:border-t-slate-600'}`
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-sub bg-surface-subtle px-2 py-0.5 rounded-md border border-subtle">
                <Clock className="w-3 h-3 text-slate-400" />
                {timingText}
              </span>
            </div>

            <h3 className={`text-base font-bold text-main ${isCompleted ? 'line-through text-muted' : ''}`}>
              {habit.title}
            </h3>

            {habit.instructions && (
              <p className="text-xs sm:text-sm text-sub mt-1 whitespace-pre-line leading-relaxed">
                {habit.instructions}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
            }`}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
          </button>
        </div>

        {/* Expandable Checklist Items */}
        {hasChecklist && (
          <div className="mt-3 pt-2 border-t border-subtle">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-sub hover:text-main"
            >
              <ListChecks className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isExpanded ? 'Hide items' : `Show ${habit.checklistItems.length} checklist items`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <ul className="mt-2 space-y-1.5 text-xs text-sub bg-surface-subtle p-2.5 rounded-lg border border-subtle">
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
