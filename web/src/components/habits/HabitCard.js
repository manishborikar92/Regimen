'use client';

import { memo } from 'react';
import { Check } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

function HabitCard({ habit, isCompleted, onToggle }) {
  const config = getCategoryConfig(habit.category);

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} 
        transition-all duration-200 hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-600">{habit.time}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClasses}`}>
            {habit.category}
          </span>
        </div>
        <h3 className={`font-bold text-gray-900 ${isCompleted ? 'line-through' : ''}`}>
          {habit.title}
        </h3>
        {habit.instructions && (
          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
            {habit.instructions}
          </p>
        )}
      </div>
      <button
        onClick={() => onToggle(habit.id)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 ${isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
          }`}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <Check className="w-4 h-4" strokeWidth={3} />}
      </button>
    </div>
  );
}

export default memo(HabitCard);
