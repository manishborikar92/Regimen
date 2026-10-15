'use client';

import { memo } from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

function StreakCounter() {
  const { streak, loading, todayStats } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50/60 via-surface to-teal-50/50 dark:from-amber-950/20 dark:to-teal-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 shadow-2xs transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-main">
              {streak} {streak === 1 ? 'Day' : 'Days'} Steady Rhythm
            </span>
          </div>
          <p className="text-2xs text-sub">
            {todayStats.isSunday
              ? 'Sunday restoration: Planned rest maintains your long-term consistency.'
              : streak > 0
              ? 'Consistency over rigidity. Every completed session anchors the habit.'
              : 'Begin gently today. Preferred times are soft guides, not deadlines.'}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0 pl-2">
        <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800/60">
          {todayStats.completed} / {todayStats.total} done
        </span>
      </div>
    </div>
  );
}

export default memo(StreakCounter);
