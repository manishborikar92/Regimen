'use client';

import { useState, memo } from 'react';
import { Headphones, BookOpen, Layers, ExternalLink } from 'lucide-react';
import { OSHO_LIBRARY } from '@/lib/fixtures/osho-library';
import OshoLibraryModal from '../OshoLibraryModal';

/**
 * SlotCatalog — Universal catalog & curriculum listening slot.
 *
 * Configured via `habit.features.catalog`:
 * - `catalogId`: Identifier (e.g., 'osho_discourses')
 * - `catalogTitle`: Title (e.g., 'Osho Discourse Audio Library')
 * - `items`: Optional custom catalog items array
 *
 * Irrevocably preserves:
 * - Osho listening disclosure: "Daily listening for awareness & self-inquiry • Series progress is separate"
 * - Action button: "Explore All 30 Discourse Titles & Links"
 * - Full Osho audio library modal and independent series progression.
 */
function SlotCatalog({
  feature = {},
  habit = {},
  userProfile = {},
  onUpdateProfile,
  disabled = false,
}) {
  const [showModal, setShowModal] = useState(false);

  const isOshoCatalog = feature.catalogId === 'osho_discourses' ||
    habit.stableKey === 'canonical_listen_osho' ||
    habit.completionMethod === 'osho_listening' ||
    (!feature.catalogId && habit.title?.toLowerCase().includes('osho'));

  // If Osho catalog, synchronize with profile state
  const activeSeriesId = userProfile?.activeOshoSeriesId || 'osho_01';
  const activeSeries = OSHO_LIBRARY.find(s => s.id === activeSeriesId) || OSHO_LIBRARY[0];
  const seriesProgress = userProfile?.oshoSeriesProgress || {};
  const currentSeriesProgress = seriesProgress[activeSeriesId] || { completedTalks: 0 };

  const handleSelectSeries = (seriesId) => {
    onUpdateProfile?.({
      activeOshoSeriesId: seriesId,
    });
  };

  const handleUpdateTalkProgress = (seriesId, completedTalks) => {
    const updated = {
      ...seriesProgress,
      [seriesId]: {
        ...(seriesProgress[seriesId] || {}),
        completedTalks,
        lastUpdated: new Date().toISOString(),
      },
    };
    onUpdateProfile?.({
      oshoSeriesProgress: updated,
    });
  };

  if (!isOshoCatalog) {
    // Generic Catalog fallback
    const items = Array.isArray(feature.items) ? feature.items : [];
    return (
      <div className="rounded-xl p-3 sm:p-3.5 bg-surface-subtle/80 dark:bg-stone-900/60 border border-subtle space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-main text-2xs uppercase tracking-tight">
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{feature.catalogTitle || 'Curriculum Catalog'}</span>
          </div>
          <span className="text-2xs text-sub">{items.length} items configured</span>
        </div>
        {items.length > 0 && (
          <div className="space-y-1">
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-surface border border-subtle text-xs text-main flex items-center justify-between">
                <span>{item.title || item.label || `Item ${idx + 1}`}</span>
                {item.url && <ExternalLink className="w-3 h-3 text-muted" />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl p-3 sm:p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 space-y-2.5">
        {/* Attribution & Irrevocable Disclosure */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-2xs uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5" />
            <span>Daily Listening Catalog</span>
          </div>
          <p className="text-2xs sm:text-xs text-sub leading-relaxed">
            Daily listening for awareness & self-inquiry • Series progress is separate
          </p>
        </div>

        {/* Currently Selected Series Banner (No Title Clipping) */}
        <div className="p-3 bg-surface/90 dark:bg-stone-900/80 rounded-xl border border-amber-200/60 dark:border-amber-800/40 space-y-2">
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
              onClick={() => setShowModal(true)}
              disabled={disabled}
              className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Change Series
            </button>
          </div>

          {/* Title row */}
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-main leading-snug">
              {activeSeries.order}. {activeSeries.title}
            </h4>
            <p className="text-2xs text-muted line-clamp-1">
              {activeSeries.theme}
            </p>
          </div>

          {/* Series Progress */}
          <div className="text-xs text-amber-900 dark:text-amber-300 font-semibold pt-0.5">
            Series Progress: Talk {currentSeriesProgress.completedTalks}
            {activeSeries.talkCount ? ` of ${activeSeries.talkCount}` : ' (Ongoing)'}
          </div>
        </div>

        {/* Footer Action: Irrevocable Explore Link */}
        <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={disabled}
            className="py-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore All 30 Discourse Titles & Links</span>
          </button>
        </div>
      </div>

      <OshoLibraryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentSeriesId={activeSeriesId}
        seriesProgress={seriesProgress}
        onSelectSeries={handleSelectSeries}
        onUpdateTalkProgress={handleUpdateTalkProgress}
      />
    </>
  );
}

export default memo(SlotCatalog);
