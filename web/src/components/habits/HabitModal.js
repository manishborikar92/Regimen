'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Clock, CheckCircle2, ListChecks, Info, Sparkles, Sunrise, Moon } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants/categories';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIMING_TYPES = [
  { id: 'anytime', label: 'Anytime', description: 'Flexible rhythm', icon: Sparkles },
  { id: 'preferred_period', label: 'Day Period', description: 'Morning, Aft, Eve', icon: Sunrise },
  { id: 'relative', label: 'Relative', description: 'e.g. Before bed', icon: Moon },
  { id: 'exact', label: 'Exact Time', description: 'Suggested target', icon: Clock },
];

const COMPLETION_METHODS = [
  { id: 'simple', label: 'Simple Checkmark' },
  { id: 'workbook_sessions', label: 'Two-Session Workbook Counter' },
  { id: 'exercise_plan', label: 'Structured Movement & Safety Routine' },
  { id: 'osho_listening', label: 'Discourse Listening Session' },
  { id: 'reading_duration', label: 'Reading Duration Target' },
  { id: 'diary_entry', label: 'Private Journal / Reflection' },
  { id: 'checklist', label: 'Custom Step Checklist' },
];

export default function HabitModal({ habit, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'English Learning',
    completionMethod: 'simple',
    timingType: 'anytime',
    preferredPeriod: 'Anytime',
    relativeTiming: 'Before bed',
    time: '',
    instructions: '',
    frequency: [...DAYS],
    checklistItems: [],
    order: 1,
    stableKey: null,
  });

  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        category: habit.category || 'English Learning',
        completionMethod: habit.completionMethod || (habit.checklistItems?.length > 0 ? 'checklist' : 'simple'),
        timingType: habit.timingType || (habit.time === 'Afternoon' ? 'preferred_period' : habit.time === 'Before bed' ? 'relative' : 'anytime'),
        preferredPeriod: habit.preferredPeriod || 'Afternoon',
        relativeTiming: habit.relativeTiming || 'Before bed',
        time: habit.time || 'Flexible',
        instructions: habit.instructions || '',
        frequency: habit.frequency || [...DAYS],
        checklistItems: habit.checklistItems || [],
        order: habit.order || 1,
        stableKey: habit.stableKey || null,
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
    if (formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Harmonize display time string based on timingType
    let displayTime = 'Flexible';
    if (formData.timingType === 'preferred_period') {
      displayTime = formData.preferredPeriod || 'Afternoon';
    } else if (formData.timingType === 'relative') {
      displayTime = formData.relativeTiming || 'Before bed';
    } else if (formData.timingType === 'exact') {
      displayTime = formData.time || '08:00 AM';
    }

    const payload = {
      ...formData,
      time: displayTime,
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

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setFormData(prev => ({
      ...prev,
      checklistItems: [...prev.checklistItems, { label: newChecklistItem.trim() }],
    }));
    setNewChecklistItem('');
  };

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[92vh] flex flex-col shadow-2xl border-t sm:border border-subtle overflow-hidden">
        {/* Header */}
        <div className="bg-surface border-b border-subtle px-5 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0 z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-main">
              {habit ? 'Edit Routine' : 'Create New Routine'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
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

            {/* Completion Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tracking / Completion Method
              </label>
              <select
                value={formData.completionMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, completionMethod: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {COMPLETION_METHODS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

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
                        className={`min-h-[46px] p-2 sm:p-2.5 rounded-xl font-medium text-left border transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700 dark:border-teal-600 shadow-2xs'
                            : 'bg-surface dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-subtle dark:border-slate-700 hover:bg-surface-subtle dark:hover:bg-slate-700/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
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

            {/* Checklist Items (if checklist method chosen) */}
            {formData.completionMethod === 'checklist' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Checklist Steps
                </label>
                <div className="space-y-1.5">
                  {formData.checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="flex-1 text-xs text-slate-800 dark:text-slate-200">{item.label}</span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

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
              </div>
            )}

            {/* Display Order */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                min={1}
                className="w-20 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-base sm:text-xs text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Sticky Modal Action Bar */}
          <div className="bg-surface border-t border-subtle px-5 py-3.5 flex items-center gap-3 flex-shrink-0 z-10">
            {habit && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                className="min-h-[44px] px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-5 py-2 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-2xs"
            >
              {saving ? 'Saving...' : habit ? 'Update Routine' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
