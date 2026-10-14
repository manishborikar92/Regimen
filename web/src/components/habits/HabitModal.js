'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Clock, CheckCircle2, ListChecks, Info } from 'lucide-react';
import { CATEGORIES, CANONICAL_CATEGORIES } from '@/lib/constants/categories';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIMING_TYPES = [
  { id: 'anytime', label: 'Anytime (Flexible)' },
  { id: 'preferred_period', label: 'Preferred Period (Morning/Afternoon/Evening)' },
  { id: 'relative', label: 'Relative (e.g., Before bed)' },
  { id: 'exact', label: 'Optional Exact Time' },
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
    time: 'Flexible',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {habit ? 'Edit Routine' : 'Create New Routine'}
            </h2>
            <p className="text-2xs sm:text-xs text-gray-500">
              Design for consistency, life purpose, and flexible completion.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Practice English Workbook"
              maxLength={120}
            />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Life-Area Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Life-Area Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <optgroup label="Canonical Life Areas">
                {CANONICAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Legacy Categories">
                {CATEGORIES.filter(c => !CANONICAL_CATEGORIES.includes(c)).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Completion Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tracking / Completion Method
            </label>
            <select
              value={formData.completionMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, completionMethod: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              {COMPLETION_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Timing Preference Model */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Timing Preference (Soft Target, Not a Deadline)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIMING_TYPES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, timingType: t.id }))}
                    className={`px-3 py-2 text-2xs sm:text-xs rounded-lg font-medium text-left border transition-all ${
                      formData.timingType === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.timingType === 'preferred_period' && (
              <div>
                <label className="block text-2xs font-semibold text-gray-600 mb-1">
                  Preferred Period of Day:
                </label>
                <div className="flex gap-2">
                  {['Morning', 'Afternoon', 'Evening'].map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredPeriod: period }))}
                      className={`flex-1 py-1.5 text-xs rounded-lg font-medium border ${
                        formData.preferredPeriod === period
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.timingType === 'relative' && (
              <div>
                <label className="block text-2xs font-semibold text-gray-600 mb-1">
                  Relative Anchor:
                </label>
                <input
                  type="text"
                  value={formData.relativeTiming}
                  onChange={(e) => setFormData(prev => ({ ...prev, relativeTiming: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  placeholder="e.g., Before bed, After waking"
                />
              </div>
            )}

            {formData.timingType === 'exact' && (
              <div>
                <label className="block text-2xs font-semibold text-gray-600 mb-1">
                  Suggested Target Time:
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  placeholder="e.g., 04:30 PM"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-2xs text-gray-500">
              <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>Preferred times guide your day without penalty for completing at other times.</span>
            </div>
          </div>

          {/* Active Days / Recurrence */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Active Weekdays
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                    formData.frequency.includes(day)
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Instructions & Purpose Notes
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={3}
              placeholder="Add purpose, instructions, or helpful notes..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
            />
          </div>

          {/* Checklist Items (if checklist method chosen) */}
          {formData.completionMethod === 'checklist' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Checklist Steps
              </label>
              <div className="space-y-1.5">
                {formData.checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="flex-1 text-xs text-gray-700">{item.label}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-rose-500 hover:text-rose-700 p-1"
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
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display Order */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-gray-700">Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
              min={1}
              className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-center font-bold"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            {habit && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-2xs"
            >
              {saving ? 'Saving...' : habit ? 'Update Routine' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
