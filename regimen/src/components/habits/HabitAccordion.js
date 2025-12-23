'use client';

import { useState } from 'react';

const categoryColors = {
  Movement: 'border-l-blue-500',
  Nutrition: 'border-l-green-500',
  Recovery: 'border-l-purple-500',
  Schedule: 'border-l-gray-500',
};

const categoryBgColors = {
  Movement: 'bg-blue-50',
  Nutrition: 'bg-green-50',
  Recovery: 'bg-purple-50',
  Schedule: 'bg-gray-50',
};

export default function HabitAccordion({ habit, isCompleted, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const borderColor = categoryColors[habit.category] || 'border-l-gray-500';
  const bgColor = categoryBgColors[habit.category] || 'bg-gray-50';

  return (
    <div
      className={`relative rounded-lg border-l-4 ${borderColor} ${bgColor} 
        transition-all duration-200 hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-600">{habit.time}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
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
            transition-all duration-200 ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {habit.checklistItems?.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 pb-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isExpanded ? 'Hide exercises' : `Show ${habit.checklistItems.length} exercises`}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="px-4 pb-4 space-y-2">
              {habit.checklistItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-700 bg-white/50 rounded-md p-2"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
