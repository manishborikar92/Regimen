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
      className={`relative rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'bg-gray-50/70 opacity-75' : ''
      }`}
    >
      {/* Accent left border */}
      <div className={`h-1.5 w-full rounded-t-xl bg-gray-300 ${isCompleted ? 'opacity-50' : 'opacity-80'}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-gray-400" />
                {timingText}
              </span>
            </div>

            <h3 className={`text-base font-bold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {habit.title}
            </h3>

            {habit.instructions && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed">
                {habit.instructions}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-gray-300 hover:border-emerald-500 text-transparent'
            }`}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Expandable Checklist Items */}
        {hasChecklist && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <ListChecks className="w-3.5 h-3.5 text-blue-500" />
              <span>{isExpanded ? 'Hide items' : `Show ${habit.checklistItems.length} checklist items`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <ul className="mt-2 space-y-1.5 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {habit.checklistItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xs font-bold">
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
