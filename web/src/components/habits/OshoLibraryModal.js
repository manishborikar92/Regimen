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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Osho Listening Library
              </h3>
              <p className="text-xs text-gray-500">
                30 Discourse Series • 6 Thematic Groups • Non-Mandatory Path
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60 space-y-2.5">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, theme, or language..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                    ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-2xs font-bold flex items-center justify-center">
                        {item.order}
                      </span>
                      <span className={`text-2xs px-2 py-0.5 rounded-full font-medium border ${
                        item.language === 'Hindi'
                          ? 'bg-orange-50 text-orange-800 border-orange-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}>
                        {item.language}
                      </span>
                      <span className="text-2xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {item.groupName.split(':')[1]?.trim() || item.groupName}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-gray-900 mt-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      <strong className="text-gray-700">Themes:</strong> {item.theme}
                    </p>

                    {/* Talk count and uncertainty note */}
                    <div className="mt-2 text-2xs sm:text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {item.talkCount !== null
                            ? `${item.talkCount} talks in primary listing`
                            : 'Compilation / Variable count across editions'}
                        </span>
                      </div>
                      <p className="text-gray-500 italic leading-snug">{item.note}</p>
                    </div>

                    {/* Links & Attribution */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-medium underline"
                      >
                        {item.isYouTubeSearch ? 'Search on YouTube' : 'View on OshoWorld.com'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {item.isYouTubeSearch && (
                        <span className="text-2xs text-gray-400">
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
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isCurrent ? 'Current Series' : 'Select as Active'}
                    </button>

                    {/* Talk progress counter if active */}
                    {isCurrent && (
                      <div className="flex items-center gap-1 text-xs bg-white p-1 rounded-md border border-amber-200">
                        <span className="text-2xs text-gray-500 px-1">Talk:</span>
                        <button
                          type="button"
                          onClick={() => onUpdateTalkProgress(item.id, Math.max(0, progress.completedTalks - 1))}
                          className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-amber-800 text-xs px-1">
                          {progress.completedTalks}
                          {item.talkCount ? ` / ${item.talkCount}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTalkProgress(item.id, progress.completedTalks + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
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
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Daily session completion is tracked separately from discourse series progress.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
