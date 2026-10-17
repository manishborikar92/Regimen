'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trash2,
  Clock,
  Info,
  Sparkles,
  Sunrise,
  Moon,
  ChevronUp,
  ChevronDown,
  Hash,
  CheckSquare,
  FileText,
  Layers,
  Calendar,
  Sliders,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/constants/categories';
import { WEEKDAYS, APPROVED_FEATURE_SLOTS, validateComposableHabit } from '@/lib/constants/habit-models';
import { normalizeChecklistItems } from '@/utils/checklist-helpers';
import {
  DEFAULT_READING_DURATION,
  getReadingTargetMinutes,
} from '@/utils/reading-helpers';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIMING_TYPES = [
  { id: 'anytime', label: 'Anytime', description: 'Flexible rhythm', icon: Sparkles },
  { id: 'preferred_period', label: 'Day Period', description: 'Morning, Aft, Eve', icon: Sunrise },
  { id: 'relative', label: 'Relative', description: 'e.g. Before bed', icon: Moon },
  { id: 'exact', label: 'Exact Time', description: 'Suggested target', icon: Clock },
];

const GENERIC_COMPLETION_STYLES = [
  { id: 'simple', label: 'Standard Check-off', description: 'One tap to mark as completed' },
  { id: 'checklist', label: 'Step-by-Step Checklist', description: 'List of steps or sub-tasks to guide your routine' },
  { id: 'diary_entry', label: 'Reflection & Notes', description: 'Private journal note with guided prompts' },
];

export const SPECIALIZED_COMPLETION_STYLES = {
  workbook_sessions: { label: 'Specialized: Two-Session Workbook Counter', description: 'Word Power Made Easy 2-session tracker' },
  exercise_plan: { label: 'Specialized: Structured Movement Plan', description: '12-week progressive movement schedule' },
  osho_listening: { label: 'Specialized: Discourse Listening Session', description: '30-discourse audio library catalog' },
  reading_duration: { label: 'Specialized: Reading Duration Target', description: 'Configurable reading timer session' },
  simple_with_notes: { label: 'Specialized: Speaking Practice with Notes', description: 'Conversational practice with autosaving notes' },
};

/**
 * Universal Composable Habit Modal.
 * Phase 2: Composable Habit Configuration Engine & Template Catalog
 */
export default function HabitModal({ habit, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    category: habit?.category || 'English Learning',
    completionMethod: habit?.completionMethod || 'simple',
    timingType: 'anytime',
    preferredPeriod: 'Afternoon',
    relativeTiming: 'Before bed',
    time: 'Flexible',
    instructions: '',
    frequency: [...DAYS],
    restDays: [],
    checklistItems: [],
    targetMinutes: getReadingTargetMinutes(habit),
    order: habit?.order || 99,
    stableKey: null,
    seedOrigin: habit?.seedOrigin || 'custom',
    templateReference: habit?.templateReference || null,
    features: {
      counter: { enabled: false, targetCount: 2, unit: 'sessions', step: 1, minCount: 0 },
      timer: { enabled: false, targetDurationMinutes: 30, mode: 'countdown', soundOnComplete: true },
      checklist: { enabled: false, items: [] },
      notes: { enabled: false, isPrivateDiary: false, placeholder: '', reflectionPrompts: [] },
      catalog: { enabled: false, catalogId: 'custom_catalog', catalogTitle: 'Catalog Items', totalItems: 0, items: [] },
      daySchedule: { enabled: false, planTitle: '', totalWeeks: 12, dayVariations: {} },
    },
  });

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'features' | 'schedule'
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newPromptChip, setNewPromptChip] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (habit) {
      // Map features
      let features = {
        counter: { enabled: false, targetCount: 2, unit: 'sessions', step: 1, minCount: 0 },
        timer: { enabled: false, targetDurationMinutes: 30, mode: 'countdown', soundOnComplete: true },
        checklist: { enabled: false, items: [] },
        notes: { enabled: false, isPrivateDiary: false, placeholder: '', reflectionPrompts: [] },
        catalog: { enabled: false, catalogId: 'custom_catalog', catalogTitle: 'Catalog Items', totalItems: 0, items: [] },
        daySchedule: { enabled: false, planTitle: '', totalWeeks: 12, dayVariations: {} },
      };

      if (habit.features && typeof habit.features === 'object') {
        features = {
          counter: habit.features.counter ? { ...features.counter, ...habit.features.counter } : features.counter,
          timer: habit.features.timer ? { ...features.timer, ...habit.features.timer } : features.timer,
          checklist: habit.features.checklist
            ? { ...features.checklist, enabled: Boolean(habit.features.checklist.enabled), items: Array.isArray(habit.features.checklist.items) ? [...habit.features.checklist.items] : [] }
            : features.checklist,
          notes: habit.features.notes ? { ...features.notes, ...habit.features.notes } : features.notes,
          catalog: habit.features.catalog ? { ...features.catalog, ...habit.features.catalog } : features.catalog,
          daySchedule: habit.features.daySchedule ? { ...features.daySchedule, ...habit.features.daySchedule } : features.daySchedule,
        };
      } else {
        const cm = habit.completionMethod;
        if (cm === 'workbook_sessions') {
          features.counter = { enabled: true, targetCount: habit.metadata?.dailySessionsTarget || 2, unit: 'sessions', step: 1, minCount: 0 };
          if (Array.isArray(habit.checklistItems) && habit.checklistItems.length > 0) {
            features.checklist = { enabled: true, items: normalizeChecklistItems(habit.checklistItems) };
          }
        } else if (cm === 'reading_duration') {
          features.timer = { enabled: true, targetDurationMinutes: getReadingTargetMinutes(habit), mode: 'countdown', soundOnComplete: true };
        } else if (cm === 'simple_with_notes') {
          features.notes = { enabled: true, isPrivateDiary: false, placeholder: 'Practice English speaking notes...' };
        } else if (cm === 'diary_entry') {
          features.notes = {
            enabled: true,
            isPrivateDiary: true,
            reflectionPrompts: habit.metadata?.reflectivePrompts || habit.metadata?.reflectionPrompts || [],
            placeholder: 'Write in your personal diary...',
          };
        } else if (cm === 'exercise_plan') {
          features.daySchedule = { enabled: true, planTitle: '12-Week Progressive Movement Plan', totalWeeks: 12, dayVariations: {} };
        } else if (cm === 'osho_listening') {
          features.catalog = { enabled: true, catalogId: 'osho_discourses', catalogTitle: 'Osho Discourses', totalItems: 30, items: [] };
          features.timer = { enabled: true, targetDurationMinutes: habit.targetMinutes || 30, mode: 'countdown', soundOnComplete: false };
        } else if (Array.isArray(habit.checklistItems) && habit.checklistItems.length > 0) {
          features.checklist = { enabled: true, items: normalizeChecklistItems(habit.checklistItems) };
        }
      }

      const schedule = habit.schedule || {};
      const frequency = Array.isArray(schedule.frequency) && schedule.frequency.length > 0
        ? schedule.frequency
        : Array.isArray(habit.frequency) && habit.frequency.length > 0
          ? habit.frequency
          : [...DAYS];

      const restDays = Array.isArray(schedule.restDays)
        ? schedule.restDays
        : Array.isArray(habit.metadata?.restDays)
          ? habit.metadata.restDays
          : [];

      const targetMinutes = getReadingTargetMinutes(habit);

      setFormData({
        title: habit.title || '',
        category: habit.category || 'English Learning',
        completionMethod: habit.completionMethod || (habit.checklistItems?.length > 0 ? 'checklist' : 'simple'),
        timingType: schedule.timingType || habit.timingType || (habit.time === 'Afternoon' ? 'preferred_period' : habit.time === 'Before bed' ? 'relative' : 'anytime'),
        preferredPeriod: schedule.preferredPeriod || habit.preferredPeriod || 'Afternoon',
        relativeTiming: schedule.relativeTiming || habit.relativeTiming || 'Before bed',
        time: schedule.exactTime || habit.time || 'Flexible',
        instructions: habit.instructions || habit.description || '',
        frequency,
        restDays,
        checklistItems: normalizeChecklistItems(habit.checklistItems || features.checklist.items),
        targetMinutes,
        order: typeof schedule.order === 'number' ? schedule.order : (habit.order || 1),
        stableKey: habit.stableKey || null,
        seedOrigin: habit.seedOrigin || 'custom',
        templateReference: habit.templateReference || null,
        features,
      });
    }
  }, [habit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }
    if (formData.frequency.length === 0) {
      newErrors.frequency = 'Select at least one active day';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let displayTime = 'Flexible';
    if (formData.timingType === 'preferred_period') {
      displayTime = formData.preferredPeriod || 'Afternoon';
    } else if (formData.timingType === 'relative') {
      displayTime = formData.relativeTiming || 'Before bed';
    } else if (formData.timingType === 'exact') {
      displayTime = formData.time || '08:00 AM';
    }

    const targetMinutes = formData.features.timer.enabled
      ? (Number(formData.features.timer.targetDurationMinutes) || 30)
      : (parseInt(formData.targetMinutes, 10) || DEFAULT_READING_DURATION);
    const cleanMetadata = { ...(habit?.metadata || {}) };
    delete cleanMetadata.targetMinutes;

    // Synchronize features and legacy fields
    const cleanFeatures = {
      counter: formData.features.counter.enabled
        ? {
            enabled: true,
            targetCount: Number(formData.features.counter.targetCount) || 1,
            unit: (formData.features.counter.unit || 'sessions').trim(),
            step: Number(formData.features.counter.step) || 1,
            minCount: Number(formData.features.counter.minCount) || 0,
          }
        : { enabled: false },
      timer: formData.features.timer.enabled
        ? {
            enabled: true,
            targetDurationMinutes: targetMinutes,
            mode: formData.features.timer.mode || 'countdown',
            soundOnComplete: Boolean(formData.features.timer.soundOnComplete),
          }
        : { enabled: false },
      checklist: (formData.features.checklist.enabled || formData.checklistItems.length > 0)
        ? {
            enabled: true,
            items: normalizeChecklistItems(formData.checklistItems.length > 0 ? formData.checklistItems : formData.features.checklist.items).map((item, idx) => ({
              id: item.id || `step_${Date.now()}_${idx}`,
              label: item.label.trim(),
              isRequiredForCompletion: Boolean(item.isRequiredForCompletion ?? true),
            })),
          }
        : { enabled: false, items: [] },
      notes: formData.features.notes.enabled
        ? {
            enabled: true,
            isPrivateDiary: Boolean(formData.features.notes.isPrivateDiary),
            placeholder: formData.features.notes.placeholder || '',
            reflectionPrompts: Array.isArray(formData.features.notes.reflectionPrompts)
              ? [...formData.features.notes.reflectionPrompts]
              : [],
          }
        : { enabled: false },
      catalog: formData.features.catalog.enabled
        ? {
            enabled: true,
            catalogId: formData.features.catalog.catalogId || 'custom_catalog',
            catalogTitle: formData.features.catalog.catalogTitle || 'Library',
            totalItems: formData.features.catalog.items?.length || formData.features.catalog.totalItems || 0,
            items: formData.features.catalog.items || [],
          }
        : { enabled: false },
      daySchedule: formData.features.daySchedule.enabled
        ? {
            enabled: true,
            planTitle: formData.features.daySchedule.planTitle || 'Weekly Plan',
            totalWeeks: Number(formData.features.daySchedule.totalWeeks) || 12,
            dayVariations: formData.features.daySchedule.dayVariations || {},
          }
        : { enabled: false },
    };

    const schedule = {
      frequency: [...formData.frequency],
      timingType: formData.timingType,
      preferredPeriod: formData.timingType === 'preferred_period' ? formData.preferredPeriod : null,
      relativeTiming: formData.timingType === 'relative' ? formData.relativeTiming : null,
      exactTime: formData.timingType === 'exact' ? formData.time : null,
      restDays: [...formData.restDays],
      order: formData.order || 1,
    };

    let legacyCompletionMethod = formData.completionMethod;
    if (cleanFeatures.counter.enabled && cleanFeatures.checklist.enabled) {
      legacyCompletionMethod = 'workbook_sessions';
    } else if (cleanFeatures.daySchedule.enabled) {
      legacyCompletionMethod = 'exercise_plan';
    } else if (cleanFeatures.catalog.enabled) {
      legacyCompletionMethod = 'osho_listening';
    } else if (cleanFeatures.timer.enabled) {
      legacyCompletionMethod = 'reading_duration';
    } else if (cleanFeatures.notes.enabled) {
      legacyCompletionMethod = cleanFeatures.notes.isPrivateDiary ? 'diary_entry' : 'simple_with_notes';
    } else if (cleanFeatures.checklist.enabled) {
      legacyCompletionMethod = 'checklist';
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      instructions: formData.instructions.trim(),
      description: formData.instructions.trim(),
      time: displayTime,
      targetMinutes,
      checklistItems: normalizeChecklistItems(formData.checklistItems),
      metadata: cleanMetadata,
      schedule,
      features: cleanFeatures,
      completionMethod: legacyCompletionMethod,
      seedOrigin: formData.seedOrigin,
      templateReference: formData.templateReference,
    };

    setSaving(true);
    try {
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      frequency: prev.frequency.includes(day)
        ? prev.frequency.filter(d => d !== day)
        : [...prev.frequency, day],
    }));
  };

  const toggleRestDay = (day) => {
    setFormData(prev => ({
      ...prev,
      restDays: prev.restDays.includes(day)
        ? prev.restDays.filter(d => d !== day)
        : [...prev.restDays, day],
    }));
  };

  const toggleFeatureSlot = (slotKey) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [slotKey]: {
          ...prev.features[slotKey],
          enabled: !prev.features[slotKey].enabled,
        },
      },
    }));
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const stableId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newItem = { id: stableId, label: newChecklistItem.trim() };
    setFormData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, newItem],
      features: {
        ...prev.features,
        checklist: {
          ...prev.features.checklist,
          enabled: true,
          items: [...prev.features.checklist.items, newItem],
        },
      },
    }));
    setNewChecklistItem('');
  };

  const updateChecklistItemLabel = (index, newLabel) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) =>
        i === index ? { ...item, label: newLabel } : item
      ),
      features: {
        ...prev.features,
        checklist: {
          ...prev.features.checklist,
          items: prev.features.checklist.items.map((item, i) =>
            i === index ? { ...item, label: newLabel } : item
          ),
        },
      },
    }));
  };

  const moveChecklistItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.checklistItems.length) return;
    const items = [...formData.checklistItems];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    setFormData(prev => ({
      ...prev,
      checklistItems: items,
      features: {
        ...prev.features,
        checklist: { ...prev.features.checklist, items },
      },
    }));
  };

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
      features: {
        ...prev.features,
        checklist: {
          ...prev.features.checklist,
          items: prev.features.checklist.items.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const addPromptChip = () => {
    if (!newPromptChip.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        notes: {
          ...prev.features.notes,
          reflectionPrompts: [
            ...(prev.features.notes.reflectionPrompts || []),
            newPromptChip.trim(),
          ],
        },
      },
    }));
    setNewPromptChip('');
  };

  const removePromptChip = (idx) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        notes: {
          ...prev.features.notes,
          reflectionPrompts: prev.features.notes.reflectionPrompts.filter((_, i) => i !== idx),
        },
      },
    }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-surface rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border-t sm:border border-subtle overflow-hidden">
          {/* Header */}
          <div className="bg-surface border-b border-subtle px-5 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0 z-10">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-main leading-tight">
                {habit ? 'Edit Routine' : 'Create New Routine'}
              </h2>
              <p className="text-2xs text-sub">
                Configure features, scheduling, and observance rhythm
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-5 bg-surface border-b border-subtle flex items-center gap-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              Basics & Category
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'features'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Features ({Object.values(formData.features).filter(f => f.enabled).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'schedule'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              Rhythm & Schedule
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* TAB 1: BASIC DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Routine Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-400"
                      placeholder="e.g., Practice English Workbook"
                      maxLength={120}
                    />
                    {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                  </div>

                  {/* Life-Area Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Life-Area Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Instructions & Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Instructions & Purpose Notes
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={3}
                      placeholder="Add purpose, instructions, or helpful notes..."
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent leading-relaxed placeholder-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: RHYTHM & SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  {/* Timing Preference Model (Compact 2x2 Responsive Architecture) */}
                  <div className="p-3 sm:p-3.5 bg-surface-subtle dark:bg-slate-800/40 rounded-xl border border-subtle dark:border-slate-700/80 space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-main mb-1.5">
                        Timing Preference (Soft Target, Not a Deadline)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        {TIMING_TYPES.map(t => {
                          const Icon = t.icon;
                          const isSelected = formData.timingType === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, timingType: t.id }))}
                              className={`min-h-[46px] p-2 sm:p-2.5 rounded-xl font-medium text-left border transition-all flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700 dark:border-teal-600 shadow-2xs'
                                  : 'bg-surface dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-subtle dark:border-slate-700 hover:bg-surface-subtle dark:hover:bg-slate-700/80'
                              }`}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold leading-tight truncate">{t.label}</span>
                                <span className={`block text-2xs leading-tight truncate mt-0.5 ${isSelected ? 'text-teal-100 dark:text-teal-200' : 'text-muted'}`}>
                                  {t.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {formData.timingType === 'preferred_period' && (
                      <div className="pt-1.5 border-t border-subtle/70">
                        <label className="block text-2xs font-semibold text-muted mb-1.5">
                          Preferred Period of Day:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {['Morning', 'Afternoon', 'Evening'].map(period => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, preferredPeriod: period }))}
                              className={`min-h-[40px] py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                                formData.preferredPeriod === period
                                  ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 font-semibold shadow-2xs'
                                  : 'bg-surface dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-subtle dark:border-slate-700 hover:bg-surface-subtle'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.timingType === 'relative' && (
                      <div className="pt-1.5 border-t border-subtle/70 space-y-1.5">
                        <label className="block text-2xs font-semibold text-muted">
                          Relative Anchor:
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {['Before bed', 'After waking', 'After lunch', 'Evening wind-down'].map(chip => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, relativeTiming: chip }))}
                              className={`text-2xs px-2.5 py-1 rounded-full border transition-colors ${
                                formData.relativeTiming === chip
                                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 font-semibold'
                                  : 'bg-surface dark:bg-slate-800 text-muted hover:text-main border-subtle'
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={formData.relativeTiming}
                          onChange={(e) => setFormData(prev => ({ ...prev, relativeTiming: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs bg-surface text-main placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="e.g., Before bed, After waking"
                        />
                      </div>
                    )}

                    {formData.timingType === 'exact' && (
                      <div className="pt-1.5 border-t border-subtle/70 space-y-1.5">
                        <label className="block text-2xs font-semibold text-muted">
                          Suggested Target Time:
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {['07:00 AM', '12:30 PM', '05:00 PM', '09:00 PM'].map(chip => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, time: chip }))}
                              className={`text-2xs px-2.5 py-1 rounded-full border transition-colors ${
                                formData.time === chip
                                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 font-semibold'
                                  : 'bg-surface dark:bg-slate-800 text-muted hover:text-main border-subtle'
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs bg-surface text-main placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="e.g., 04:30 PM"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-2xs text-muted pt-0.5">
                      <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span>Preferred times guide your day without penalty for completing at other times.</span>
                    </div>
                  </div>

                  {/* Active Days / Recurrence */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Active Weekdays
                    </label>
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`w-full h-10 min-h-[40px] flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                            formData.frequency.includes(day)
                              ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {errors.frequency && <p className="text-rose-500 text-xs mt-1">{errors.frequency}</p>}
                  </div>

                  {/* Planned Rest Days */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-main">
                        Planned Rest Days
                      </label>
                      <span className="text-2xs text-muted">Never breaks streaks</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRestDay(day)}
                          className={`w-full h-8 min-h-[32px] flex items-center justify-center rounded-lg text-2xs font-bold transition-all ${
                            formData.restDays.includes(day)
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-surface border border-subtle text-muted hover:text-main'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COMPOSABLE FEATURE SLOTS */}
              {activeTab === 'features' && (
                <div className="space-y-3.5">
                  {/* 1. Counter Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.counter.enabled
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                          <Hash className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Counter Stepper</span>
                          <span className="text-2xs text-muted block">Multi-session or countable quantity tracking</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('counter')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.counter.enabled
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.counter.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.counter.enabled && (
                      <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1">Target Count</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.features.counter.targetCount}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                counter: { ...prev.features.counter, targetCount: parseInt(e.target.value, 10) || 1 },
                              },
                            }))}
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                          />
                        </div>
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1">Unit Label</label>
                          <input
                            type="text"
                            value={formData.features.counter.unit}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                counter: { ...prev.features.counter, unit: e.target.value },
                              },
                            }))}
                            placeholder="e.g. sessions, glasses"
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Timer Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.timer.enabled
                      ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Duration Timer</span>
                          <span className="text-2xs text-muted block">Focus countdown with Web Audio chime</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('timer')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.timer.enabled
                            ? 'bg-teal-700 dark:bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.timer.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.timer.enabled && (
                      <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-900/40 space-y-2.5">
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1.5">Target Duration (Minutes)</label>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {[10, 15, 20, 25, 30, 45, 60].map(mins => (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  targetMinutes: mins,
                                  features: {
                                    ...prev.features,
                                    timer: { ...prev.features.timer, targetDurationMinutes: mins },
                                  },
                                }))}
                                className={`px-2.5 py-1 text-2xs rounded-lg font-semibold border transition-colors ${
                                  formData.features.timer.targetDurationMinutes === mins
                                    ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700'
                                    : 'bg-surface border-subtle text-muted hover:text-main'
                                }`}
                              >
                                {mins}m
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="text-2xs text-muted flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.features.timer.soundOnComplete}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                features: {
                                  ...prev.features,
                                  timer: { ...prev.features.timer, soundOnComplete: e.target.checked },
                                },
                              }))}
                              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                            />
                            <span>Play peaceful audio chime on timer completion</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Checklist Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.checklist.enabled
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Step-by-Step Checklist</span>
                          <span className="text-2xs text-muted block">Multi-step action sequence or prerequisites</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('checklist')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.checklist.enabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.checklist.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.checklist.enabled && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {formData.checklistItems.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                              <span className="text-2xs font-bold text-slate-400 w-4 text-center select-none flex-shrink-0">
                                {index + 1}.
                              </span>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateChecklistItemLabel(index, e.target.value)}
                                className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 border-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1.5 py-1"
                                placeholder="Step description..."
                                aria-label={`Step ${index + 1} description`}
                              />
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => moveChecklistItem(index, -1)}
                                  disabled={index === 0}
                                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                                  aria-label={`Move step ${index + 1} up`}
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveChecklistItem(index, 1)}
                                  disabled={index === formData.checklistItems.length - 1}
                                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                                  aria-label={`Move step ${index + 1} down`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeChecklistItem(index)}
                                  className="w-7 h-7 flex items-center justify-center text-rose-500 hover:text-rose-700 rounded"
                                  aria-label={`Remove step ${index + 1}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addChecklistItem();
                              }
                            }}
                            placeholder="Add step or exercise..."
                            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={addChecklistItem}
                            className="min-h-[38px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Add Step
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Notes & Reflection Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.notes.enabled
                      ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Notes & Reflection</span>
                          <span className="text-2xs text-muted block">Autosaved journal entry with optional guided prompt chips</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('notes')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.notes.enabled
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.notes.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.notes.enabled && (
                      <div className="mt-3 pt-3 border-t border-teal-200/60 dark:border-teal-900/40 space-y-2.5">
                        <label className="text-2xs text-muted flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.features.notes.isPrivateDiary)}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                notes: { ...prev.features.notes, isPrivateDiary: e.target.checked },
                              },
                            }))}
                            className="rounded text-teal-600 w-3.5 h-3.5"
                          />
                          <span className="font-semibold text-main">Private Diary Mode (Strict user isolation)</span>
                        </label>

                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1">Textarea Placeholder</label>
                          <input
                            type="text"
                            value={formData.features.notes.placeholder || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                notes: { ...prev.features.notes, placeholder: e.target.value },
                              },
                            }))}
                            placeholder="e.g., Today's learnings, insights, or gratitude..."
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                          />
                        </div>

                        {/* Reflection Prompt Chips */}
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1.5">Guiding Prompt Chips</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {(formData.features.notes.reflectionPrompts || []).map((prompt, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-2xs"
                              >
                                <span>{prompt}</span>
                                <button
                                  type="button"
                                  onClick={() => removePromptChip(idx)}
                                  className="text-teal-500 hover:text-teal-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newPromptChip}
                              onChange={(e) => setNewPromptChip(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addPromptChip();
                                }
                              }}
                              placeholder="Add a guiding prompt chip..."
                              className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                            />
                            <button
                              type="button"
                              onClick={addPromptChip}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                            >
                              Add Chip
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Catalog Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.catalog.enabled
                      ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Multi-Item Catalog</span>
                          <span className="text-2xs text-muted block">Curated discourse syllabus or lecture audio collection</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('catalog')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.catalog.enabled
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.catalog.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.catalog.enabled && (
                      <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-900/40 space-y-2">
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1">Catalog Title</label>
                          <input
                            type="text"
                            value={formData.features.catalog.catalogTitle}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                catalog: { ...prev.features.catalog, catalogTitle: e.target.value },
                              },
                            }))}
                            placeholder="e.g., Contemplative Discourses"
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                          />
                        </div>
                        <p className="text-2xs text-muted">
                          Catalog items can be loaded directly from the template catalog.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 6. Day Schedule Slot */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    formData.features.daySchedule.enabled
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      : 'bg-surface border-subtle'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-main block">Progressive Day Schedule</span>
                          <span className="text-2xs text-muted block">Multi-week conditioning plan with day variations</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeatureSlot('daySchedule')}
                        className={`px-3 py-1 rounded-full text-2xs font-bold transition-colors ${
                          formData.features.daySchedule.enabled
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-muted'
                        }`}
                      >
                        {formData.features.daySchedule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {formData.features.daySchedule.enabled && (
                      <div className="mt-3 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 space-y-2">
                        <div>
                          <label className="block text-2xs font-semibold text-main mb-1">Plan Title</label>
                          <input
                            type="text"
                            value={formData.features.daySchedule.planTitle}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              features: {
                                ...prev.features,
                                daySchedule: { ...prev.features.daySchedule, planTitle: e.target.value },
                              },
                            }))}
                            placeholder="e.g. 12-Week Progressive Movement Plan"
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-surface text-main"
                          />
                        </div>
                        <p className="text-2xs text-muted">
                          Structured weekday-specific routines with integrated Sunday rest day support.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Modal Action Bar */}
            <div className="bg-surface border-t border-subtle px-5 py-2 flex items-center gap-3 flex-shrink-0 z-10">
              {habit && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(habit.id)}
                  className="px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-2xs"
              >
                {saving ? 'Saving...' : habit ? 'Update Routine' : 'Create Routine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
