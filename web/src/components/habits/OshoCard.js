'use client';

import { useState, memo } from 'react';
import { Headphones, Check, ExternalLink, Clock, Sparkles, BookOpen } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { OSHO_LIBRARY } from '@/lib/fixtures/osho-library';
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
        className={`relative rounded-xl border border-t-[3px] bg-surface shadow-sm transition-all duration-200 hover:shadow-md ${
          isCompleted
            ? 'bg-amber-50/20 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 border-t-amber-500 dark:border-t-amber-400'
            : 'border-subtle border-t-amber-500 dark:border-t-amber-400'
        }`}
      >
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                  {habit.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-sub bg-surface-subtle px-2 py-0.5 rounded-md border border-subtle">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Anytime
                </span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                  Daily Listening
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
                <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                {habit.title}
              </h3>

              <p className="text-xs sm:text-sm text-sub mt-1">
                Listen daily for awareness and self-inquiry. Series progress is separate from daily completion.
              </p>
            </div>

            {/* Quick Completion Button */}
            <button
              type="button"
              onClick={() => onToggle(habit.id)}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                  : 'border-slate-300 dark:border-slate-600 hover:border-amber-500 text-transparent'
              }`}
              aria-label={isCompleted ? 'Mark listening incomplete' : 'Mark listening complete'}
            >
              {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          </div>

          {/* Currently Selected Series Banner */}
          <div className="mt-4 p-3.5 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Active Series
                </span>
                <span className="text-2xs px-1.5 py-0.5 bg-surface rounded border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium">
                  {activeSeries.language}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-main truncate">
                {activeSeries.order}. {activeSeries.title}
              </p>
              <p className="text-2xs text-sub line-clamp-1">
                {activeSeries.theme}
              </p>
              <div className="text-xs text-amber-900 dark:text-amber-300 font-semibold pt-1">
                Series Progress: Talk {currentSeriesProgress.completedTalks}
                {activeSeries.talkCount ? ` of ${activeSeries.talkCount}` : ' (Ongoing)'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="min-h-[40px] px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex-shrink-0 flex items-center justify-center"
            >
              Change Series
            </button>
          </div>

          {/* Footer Action */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Explore All 30 Discourse Titles & Links
            </button>

            <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              {isCompleted ? 'Today Listened' : 'Not Yet Today'}
            </span>
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
