'use client';

// Category color mapping
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

export default function HabitCard({ habit, isCompleted, onToggle }) {
  const borderColor = categoryColors[habit.category] || 'border-l-gray-500';
  const bgColor = categoryBgColors[habit.category] || 'bg-gray-50';

  return (
    <div
      className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 ${borderColor} ${bgColor} 
        transition-all duration-200 hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-600">{habit.time}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            habit.category === 'Movement' ? 'bg-blue-100 text-blue-700' :
            habit.category === 'Nutrition' ? 'bg-green-100 text-green-700' :
            habit.category === 'Recovery' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {habit.category}
          </span>
        </div>
        <h3 className={`font-bold text-gray-900 ${isCompleted ? 'line-through' : ''}`}>
          {habit.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
          {habit.instructions}
        </p>
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
  );
}
