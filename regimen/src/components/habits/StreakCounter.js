'use client';

import { useData } from '@/contexts/DataContext';

export default function StreakCounter() {
  const { streak, loading } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl">
        <div className="animate-pulse text-gray-400">Loading streak...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl">
      <span className="text-4xl">🔥</span>
      <div>
        <span className="text-3xl font-bold text-orange-600">{streak}</span>
        <span className="text-lg text-orange-700 ml-2">Day Streak</span>
      </div>
    </div>
  );
}
