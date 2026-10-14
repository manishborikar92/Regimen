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
        className={`relative rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
          isCompleted ? 'bg-amber-50/20 border-amber-200' : ''
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full rounded-t-xl bg-gradient-to-r from-amber-500 to-orange-500 ${
            isCompleted ? 'opacity-80' : 'opacity-40'
          }`}
        />

        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                  {habit.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-gray-400" />
                  Anytime
                </span>
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Daily Listening
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-amber-600 flex-shrink-0" />
                {habit.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Listen daily for awareness and self-inquiry. Series progress is separate from daily completion.
              </p>
            </div>

            {/* Quick Completion Button */}
            <button
              type="button"
              onClick={() => onToggle(habit.id)}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                  : 'border-gray-300 hover:border-amber-500 text-transparent'
              }`}
              aria-label={isCompleted ? 'Mark listening incomplete' : 'Mark listening complete'}
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </button>
          </div>

          {/* Currently Selected Series Banner */}
          <div className="mt-4 p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider">
                  Active Series
                </span>
                <span className="text-2xs px-1.5 py-0.2 bg-white rounded border border-amber-200 text-amber-900 font-medium">
                  {activeSeries.language}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {activeSeries.order}. {activeSeries.title}
              </p>
              <p className="text-2xs text-gray-600 line-clamp-1">
                {activeSeries.theme}
              </p>
              <div className="text-xs text-amber-900 font-semibold pt-1">
                Series Progress: Talk {currentSeriesProgress.completedTalks}
                {activeSeries.talkCount ? ` of ${activeSeries.talkCount}` : ' (Ongoing)'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors flex-shrink-0"
            >
              Change Series
            </button>
          </div>

          {/* Footer Action */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Explore All 30 Discourse Titles & Links
            </button>

            <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
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
