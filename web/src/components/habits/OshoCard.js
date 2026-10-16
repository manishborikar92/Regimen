'use client';

import { useState, memo } from 'react';
import { Headphones, Check, Clock, Sparkles, BookOpen } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { OSHO_LIBRARY } from '@/lib/fixtures/osho-library';
import { useSound } from '@/contexts';
import OshoLibraryModal from './OshoLibraryModal';

function OshoCard({
  habit,
  isCompleted,
  progress = {},
  onToggle,
  onUpdateProgress,
  userProfile = {},
  onUpdateProfile,
}) {
  const { playStepToggleCue, playHabitCompleteCue } = useSound();
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const config = getCategoryConfig(habit.category);

  // Active series ID from profile or default to first series
  const activeSeriesId = userProfile?.activeOshoSeriesId || 'osho_01';
  const activeSeries = OSHO_LIBRARY.find(s => s.id === activeSeriesId) || OSHO_LIBRARY[0];

  const seriesProgress = userProfile?.oshoSeriesProgress || {};
  const currentSeriesProgress = seriesProgress[activeSeriesId] || { completedTalks: 0 };

  const handleSelectSeries = (seriesId) => {
    if (onUpdateProfile) {
      onUpdateProfile({
        activeOshoSeriesId: seriesId,
      });
    }
  };

  const handleUpdateTalkProgress = (seriesId, completedTalks) => {
    if (onUpdateProfile) {
      const updatedSeriesProgress = {
        ...seriesProgress,
        [seriesId]: {
          ...(seriesProgress[seriesId] || {}),
          completedTalks,
          lastUpdated: new Date().toISOString(),
        },
      };
      onUpdateProfile({
        oshoSeriesProgress: updatedSeriesProgress,
      });
    }
  };

  return (
    <>
      <div
        className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
          isCompleted
            ? 'bg-amber-50/20 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 border-t-amber-500 dark:border-t-amber-400'
            : 'border-subtle border-t-amber-500 dark:border-t-amber-400'
        }`}
      >
        <div className="p-3.5 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                  {habit.category}
                </span>
                <span className="text-2xs sm:text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                  Daily Listening
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
                <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>{habit.title}</span>
              </h3>

              <p className="text-xs text-sub mt-0.5 leading-relaxed">
                Daily listening for awareness & self-inquiry • Series progress is separate
              </p>
            </div>

            {/* Quick Completion Button */}
            <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  if (!isCompleted) {
                    playHabitCompleteCue?.();
                  } else {
                    playStepToggleCue?.(false);
                  }
                  onToggle?.(habit.id);
                }}
                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                    : 'border-stone-300 dark:border-stone-600 hover:border-amber-500 text-transparent'
                }`}
                aria-label={isCompleted ? 'Mark listening incomplete' : 'Mark listening complete'}
              >
                {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
              </button>
            </div>
          </div>

          {/* Currently Selected Series Banner (No Title Clipping) */}
          <div className="mt-3 p-3 sm:p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-800/50 space-y-2">
            {/* Top row of banner: Label + Language on left, Change Series on right */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Active Series
                </span>
                <span className="text-2xs px-1.5 py-0.5 bg-surface rounded border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-semibold">
                  {activeSeries.language}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLibraryModal(true)}
                className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center shadow-2xs"
              >
                Change Series
              </button>
            </div>

            {/* Title row: Full width to prevent clipping */}
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {activeSeries.order}. {activeSeries.title}
              </h4>
              <p className="text-2xs text-stone-500 dark:text-stone-400 line-clamp-1">
                {activeSeries.theme}
              </p>
            </div>

            {/* Series Progress */}
            <div className="text-xs text-amber-900 dark:text-amber-300 font-semibold pt-0.5">
              Series Progress: Talk {currentSeriesProgress.completedTalks}
              {activeSeries.talkCount ? ` of ${activeSeries.talkCount}` : ' (Ongoing)'}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-stone-800/80 text-xs">
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="py-2 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore All 30 Discourse Titles & Links</span>
            </button>
          </div>
        </div>
      </div>

      <OshoLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        currentSeriesId={activeSeriesId}
        seriesProgress={seriesProgress}
        onSelectSeries={handleSelectSeries}
        onUpdateTalkProgress={handleUpdateTalkProgress}
      />
    </>
  );
}

export default memo(OshoCard);
