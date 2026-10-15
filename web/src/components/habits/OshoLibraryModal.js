'use client';

import { useState } from 'react';
import { ExternalLink, Headphones, Search, CheckCircle2, BookmarkCheck, BookOpen, AlertCircle } from 'lucide-react';
import { OSHO_GROUPS, OSHO_LIBRARY } from '@/lib/fixtures/osho-library';

export default function OshoLibraryModal({
  isOpen,
  onClose,
  currentSeriesId,
  seriesProgress = {},
  onSelectSeries,
  onUpdateTalkProgress,
}) {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLibrary = OSHO_LIBRARY.filter(item => {
    const matchesGroup = selectedGroup === 'all' || item.groupId === selectedGroup;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/40 dark:bg-amber-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Osho Listening Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                30 Discourse Series • 6 Thematic Groups • Non-Mandatory Path
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 space-y-2.5">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, theme, or language..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400"
            />
          </div>

          {/* Group pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedGroup === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All 30 Series
            </button>
            {OSHO_GROUPS.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGroup(g.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedGroup === g.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {g.name.split(':')[0]} ({g.language})
              </button>
            ))}
          </div>
        </div>

        {/* Series List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredLibrary.map(item => {
            const isCurrent = currentSeriesId === item.id;
            const progress = seriesProgress[item.id] || { completedTalks: 0, isCompleted: false };

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-950/20 ring-1 ring-amber-300 dark:ring-amber-700'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-2xs font-bold flex items-center justify-center">
                        {item.order}
                      </span>
                      <span className={`text-2xs px-2 py-0.5 rounded-full font-medium border ${
                        item.language === 'Hindi'
                          ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800/60'
                          : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60'
                      }`}>
                        {item.language}
                      </span>
                      <span className="text-2xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {item.groupName.split(':')[1]?.trim() || item.groupName}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      <strong className="text-slate-800 dark:text-slate-200">Themes:</strong> {item.theme}
                    </p>

                    {/* Talk count and uncertainty note */}
                    <div className="mt-2 text-2xs sm:text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>
                          {item.talkCount !== null
                            ? `${item.talkCount} talks in primary listing`
                            : 'Compilation / Variable count across editions'}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 italic leading-snug">{item.note}</p>
                    </div>

                    {/* Links & Attribution */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-medium underline"
                      >
                        {item.isYouTubeSearch ? 'Search on YouTube' : 'View on OshoWorld.com'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {item.isYouTubeSearch && (
                        <span className="text-2xs text-slate-400 dark:text-slate-500">
                          (Discovery search query, not direct recording)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectSeries(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {isCurrent ? 'Current Series' : 'Select as Active'}
                    </button>

                    {/* Talk progress counter if active */}
                    {isCurrent && (
                      <div className="flex items-center gap-1 text-xs bg-white dark:bg-slate-900 p-1 rounded-md border border-amber-200 dark:border-amber-800">
                        <span className="text-2xs text-slate-500 dark:text-slate-400 px-1">Talk:</span>
                        <button
                          type="button"
                          onClick={() => onUpdateTalkProgress(item.id, Math.max(0, progress.completedTalks - 1))}
                          className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-amber-800 dark:text-amber-300 text-xs px-1">
                          {progress.completedTalks}
                          {item.talkCount ? ` / ${item.talkCount}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTalkProgress(item.id, progress.completedTalks + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Daily session completion is tracked separately from discourse series progress.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
