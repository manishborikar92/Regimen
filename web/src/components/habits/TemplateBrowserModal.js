'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Clock,
  CheckSquare,
  Timer,
  Hash,
  FileText,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { CATEGORIES, getCategoryConfig } from '@/lib/constants/categories';
import { fetchScheduleTemplates } from '@/lib/firebase/firestore';

const APPROVED_FEATURE_FILTERS = [
  { id: 'all', label: 'All Features' },
  { id: 'counter', label: 'Counter', icon: Hash },
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'catalog', label: 'Catalog', icon: BookOpen },
  { id: 'daySchedule', label: 'Day Schedule', icon: Calendar },
];

/**
 * TemplateBrowserModal — Responsive Schedule Template Browser & Preview.
 *
 * Implements:
 * - Direct browsing of authoritative shared `scheduleTemplates` collection.
 * - Dynamic category and feature filtering.
 * - Full template preview mode showing complete routine instructions and feature breakdowns.
 * - Pre-populates HabitModal for customization and saving to user habits.
 * - WCAG 2.2 touch targets (min 44x44px) and responsive design (320px to 1280px).
 */
export default function TemplateBrowserModal({ isOpen, onClose, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadTemplates() {
      setLoading(true);
      try {
        const data = await fetchScheduleTemplates();
        if (isMounted) {
          setTemplates(data || []);
        }
      } catch (err) {
        console.error('Failed to load schedule templates:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewTemplate) {
          setPreviewTemplate(null);
        } else {
          onClose?.();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewTemplate, onClose]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Feature filter
      if (selectedFeature !== 'all') {
        const f = t.features || {};
        if (!f[selectedFeature]?.enabled) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchTags = Array.isArray(t.metadata?.tags) && t.metadata.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchCat && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [templates, selectedCategory, selectedFeature, searchQuery]);

  if (!isOpen) return null;

  const handleUseTemplate = (template) => {
    // Clone template and prepare as an unsaved user habit
    const routineData = {
      title: template.title || '',
      category: template.category || 'Health & Fitness',
      description: template.description || '',
      instructions: template.instructions || template.description || '',
      schedule: {
        frequency: Array.isArray(template.schedule?.frequency) ? [...template.schedule.frequency] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        timingType: template.schedule?.timingType || 'anytime',
        preferredPeriod: template.schedule?.preferredPeriod || 'Morning',
        relativeTiming: template.schedule?.relativeTiming || null,
        exactTime: template.schedule?.exactTime || null,
        restDays: Array.isArray(template.schedule?.restDays) ? [...template.schedule.restDays] : [],
        order: template.schedule?.order || 1,
      },
      features: {
        counter: template.features?.counter ? { ...template.features.counter } : { enabled: false },
        timer: template.features?.timer ? { ...template.features.timer } : { enabled: false },
        checklist: template.features?.checklist
          ? { enabled: Boolean(template.features.checklist.enabled), items: Array.isArray(template.features.checklist.items) ? [...template.features.checklist.items] : [] }
          : { enabled: false, items: [] },
        notes: template.features?.notes ? { ...template.features.notes } : { enabled: false },
        catalog: template.features?.catalog ? { ...template.features.catalog } : { enabled: false },
        daySchedule: template.features?.daySchedule ? { ...template.features.daySchedule } : { enabled: false },
      },
      metadata: template.metadata ? { ...template.metadata } : {},
      seedOrigin: 'template',
      templateReference: template.id,
      id: null, // Zero ID ensures new unique document is created under user's UID
    };

    onSelectTemplate?.(routineData);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={() => onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-browser-title"
    >
      <div
        className="w-full max-w-4xl bg-surface border border-subtle dark:border-stone-800 rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-subtle dark:border-stone-800 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="template-browser-title" className="text-base sm:text-lg font-bold text-main leading-tight">
                {previewTemplate ? 'Template Preview' : 'Schedule Templates Catalog'}
              </h2>
              <p className="text-2xs text-sub">
                {previewTemplate
                  ? 'Review details and add to your daily schedule'
                  : 'Choose a proven blueprint to customize for your daily rhythm'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (previewTemplate) {
                setPreviewTemplate(null);
              } else {
                onClose?.();
              }
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-sub hover:text-main hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Close template browser"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {previewTemplate ? (
          /* ==================================================================== */
          /* Detail Preview View                                                  */
          /* ==================================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-subtle text-xs font-semibold text-main hover:bg-surface-subtle transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => handleUseTemplate(previewTemplate)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors shadow-2xs min-h-[44px]"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-2xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      getCategoryConfig(previewTemplate.category).badgeClasses
                    }`}
                  >
                    {previewTemplate.category}
                  </span>
                  {previewTemplate.metadata?.difficulty && (
                    <span className="text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                      {previewTemplate.metadata.difficulty}
                    </span>
                  )}
                  {previewTemplate.metadata?.estimatedMinutes && (
                    <span className="text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{previewTemplate.metadata.estimatedMinutes} min</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-main">{previewTemplate.title}</h3>
                <p className="text-xs sm:text-sm text-sub mt-1">{previewTemplate.description}</p>
              </div>

              {/* Instructions */}
              {previewTemplate.instructions && (
                <div className="p-4 rounded-xl bg-surface-subtle/80 border border-subtle space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-main">Instructions & Observance</h4>
                  <div className="text-xs text-sub whitespace-pre-line leading-relaxed font-normal">
                    {previewTemplate.instructions}
                  </div>
                </div>
              )}

              {/* Schedule Details */}
              <div className="p-4 rounded-xl bg-surface-subtle/80 border border-subtle space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-main">Schedule Rhythm</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted font-medium">Frequency: </span>
                    <span className="text-main font-semibold">
                      {previewTemplate.schedule?.frequency?.length === 7
                        ? 'Every day (7 days)'
                        : previewTemplate.schedule?.frequency?.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted font-medium">Timing: </span>
                    <span className="text-main font-semibold">
                      {previewTemplate.schedule?.preferredPeriod ||
                        previewTemplate.schedule?.relativeTiming ||
                        previewTemplate.schedule?.exactTime ||
                        'Flexible / Anytime'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feature Slots Enabled */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-main">Enabled Feature Slots</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Counter */}
                  {previewTemplate.features?.counter?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <Hash className="w-4 h-4" />
                        <span>Counter Slot</span>
                      </div>
                      <p className="text-xs text-sub">
                        Target: <strong className="text-main">{previewTemplate.features.counter.targetCount}</strong> {previewTemplate.features.counter.unit}
                      </p>
                    </div>
                  )}

                  {/* Timer */}
                  {previewTemplate.features?.timer?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <Timer className="w-4 h-4" />
                        <span>Timer Slot</span>
                      </div>
                      <p className="text-xs text-sub">
                        Target: <strong className="text-main">{previewTemplate.features.timer.targetDurationMinutes} min</strong> ({previewTemplate.features.timer.mode || 'countdown'})
                      </p>
                    </div>
                  )}

                  {/* Checklist */}
                  {previewTemplate.features?.checklist?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1.5 sm:col-span-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <CheckSquare className="w-4 h-4" />
                        <span>Checklist Steps ({previewTemplate.features.checklist.items?.length || 0})</span>
                      </div>
                      <ul className="space-y-1 pl-1">
                        {previewTemplate.features.checklist.items?.map((item, idx) => (
                          <li key={item.id || idx} className="text-2xs sm:text-xs text-sub flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-1.5 shrink-0" />
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {previewTemplate.features?.notes?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <FileText className="w-4 h-4" />
                        <span>Notes & Reflection</span>
                      </div>
                      <p className="text-xs text-sub">
                        {previewTemplate.features.notes.isPrivateDiary ? 'Private diary format with prompts' : 'Freeform reflective practice notes'}
                      </p>
                    </div>
                  )}

                  {/* Catalog */}
                  {previewTemplate.features?.catalog?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <BookOpen className="w-4 h-4" />
                        <span>Multi-Item Catalog</span>
                      </div>
                      <p className="text-xs text-sub">
                        Catalog: <strong className="text-main">{previewTemplate.features.catalog.catalogTitle}</strong> ({previewTemplate.features.catalog.totalItems || 30} items)
                      </p>
                    </div>
                  )}

                  {/* Day Schedule */}
                  {previewTemplate.features?.daySchedule?.enabled && (
                    <div className="p-3.5 rounded-xl border border-subtle bg-surface space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
                        <Calendar className="w-4 h-4" />
                        <span>Day Schedule</span>
                      </div>
                      <p className="text-xs text-sub">
                        Plan: <strong className="text-main">{previewTemplate.features.daySchedule.planTitle || 'Progressive Movement'}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* Template Catalog List View                                           */
          /* ==================================================================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Search & Filter Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by title, description, or tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle/80 border border-subtle text-xs sm:text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal-600 min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main text-xs p-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Pills (Horizontally Scrollable) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 min-h-[36px] ${
                    selectedCategory === 'all'
                      ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-2xs'
                      : 'bg-surface-subtle border border-subtle text-sub hover:text-main'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 min-h-[36px] ${
                      selectedCategory === cat
                        ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-2xs'
                        : 'bg-surface-subtle border border-subtle text-sub hover:text-main'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Feature Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-2xs">
                <span className="text-muted font-medium shrink-0 mr-1">Feature:</span>
                {APPROVED_FEATURE_FILTERS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFeature(f.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 min-h-[34px] ${
                        selectedFeature === f.id
                          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-stone-900 font-semibold shadow-2xs'
                          : 'bg-surface-subtle border border-subtle text-sub hover:text-main'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Count Header */}
            <div className="flex items-center justify-between text-2xs text-sub px-1 pt-1">
              <span>
                Showing <strong>{filteredTemplates.length}</strong> of {templates.length} templates
              </span>
              {(selectedCategory !== 'all' || selectedFeature !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedFeature('all');
                    setSearchQuery('');
                  }}
                  className="text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Template Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 rounded-2xl bg-surface-subtle animate-pulse border border-subtle" />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12 px-4 bg-surface-subtle/50 rounded-2xl border border-dashed border-subtle space-y-2">
                <p className="text-sm font-bold text-main">No templates match your filters</p>
                <p className="text-xs text-sub">Try selecting another life area or clearing your search query.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedFeature('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredTemplates.map((template) => {
                  const catConfig = getCategoryConfig(template.category);
                  const f = template.features || {};

                  return (
                    <div
                      key={template.id}
                      className="rounded-2xl border border-subtle bg-surface hover:border-teal-500/50 hover:shadow-xs transition-all flex flex-col justify-between p-4 sm:p-5 space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-2xs px-2.5 py-0.5 rounded-full font-semibold border ${catConfig.badgeClasses}`}>
                            {catConfig.label || template.category}
                          </span>
                          {template.metadata?.isFoundation && (
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              Foundation
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-main leading-snug">{template.title}</h3>
                          <p className="text-xs text-sub mt-1 line-clamp-2 leading-relaxed">{template.description}</p>
                        </div>

                        {/* Feature Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {f.counter?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <Hash className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{f.counter.targetCount} {f.counter.unit}</span>
                            </span>
                          )}
                          {f.timer?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <Timer className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{f.timer.targetDurationMinutes}m</span>
                            </span>
                          )}
                          {f.checklist?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <CheckSquare className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>{f.checklist.items?.length || 0} steps</span>
                            </span>
                          )}
                          {f.notes?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>Notes</span>
                            </span>
                          )}
                          {f.catalog?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <BookOpen className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>Catalog</span>
                            </span>
                          )}
                          {f.daySchedule?.enabled && (
                            <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-md bg-surface-subtle border border-subtle text-sub font-medium">
                              <Calendar className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              <span>Schedule</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-subtle dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(template)}
                          className="px-3 py-2 text-xs font-semibold text-sub hover:text-main hover:bg-surface-subtle rounded-xl transition-colors min-h-[44px]"
                        >
                          Preview Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUseTemplate(template)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors shadow-2xs min-h-[44px]"
                        >
                          <span>Use Template</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-subtle dark:border-stone-800 bg-surface-subtle/50 flex items-center justify-between text-2xs text-muted">
          <span>Templates are reusable blueprints. Adding a template creates your own private copy.</span>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="px-3 py-1.5 rounded-lg border border-subtle bg-surface text-main font-semibold hover:bg-surface-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
