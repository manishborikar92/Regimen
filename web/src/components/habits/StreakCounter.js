'use client';

import { memo } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

function StreakCounter() {
  const { streak, loading, todayStats } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-pulse">
        <div className="h-4 bg-indigo-200/50 rounded w-28" />
        <div className="h-4 bg-indigo-200/50 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50/80 via-white to-teal-50/60 rounded-xl border border-indigo-100/80 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">
              {streak} {streak === 1 ? 'Day' : 'Days'} Steady Rhythm
            </span>
          </div>
          <p className="text-2xs text-gray-500">
            {todayStats.isSunday
              ? 'Sunday restoration: Planned rest maintains your long-term consistency.'
              : streak > 0
              ? 'Consistency over rigidity. Every completed session anchors the habit.'
              : 'Begin gently today. Preferred times are soft guides, not deadlines.'}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        <span className="text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-full border border-indigo-200">
          {todayStats.completed} / {todayStats.total} done
        </span>
      </div>
    </div>
  );
}

export default memo(StreakCounter);
