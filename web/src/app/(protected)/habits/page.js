'use client';

import { useState, useRef } from 'react';
import { Pencil, Trash2, Plus, Compass, Clock } from 'lucide-react';
import { useData, useToast } from '@/contexts';
import { TopNav, ConfirmDialog, LoadingSpinner } from '@/components/ui';
import { HabitModal } from '@/components/habits';
import { getCategoryConfig } from '@/lib/constants/categories';
import { getTimingDisplay } from '@/utils/date-helpers';
import { BRAND } from '@/lib/constants/brand';

export default function HabitsPage() {
  const { habits, loading, addHabit, updateHabit, deleteHabit, seedHabits } = useData();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const isSeedingRef = useRef(false);

  const handleSave = async (formData) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData);
      } else {
        await addHabit(formData);
      }
      setShowModal(false);
      setEditingHabit(null);
      addToast(`Routine ${editingHabit ? 'updated' : 'created'} successfully`, 'success');
    } catch (err) {
      console.error('Error saving routine:', err);
      addToast('Failed to save routine. Please try again.', 'error');
    }
  };

  const handleDelete = async (habitId) => {
    setIsDeleting(true);
    try {
      await deleteHabit(habitId);
      setShowModal(false);
      setEditingHabit(null);
      setDeleteConfirm(null);
      addToast('Routine removed. Past logs remain preserved.', 'success');
    } catch (err) {
      console.error('Error deleting routine:', err);
      addToast('Failed to delete routine. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedHabits = async () => {
    // Only permit seeding when user has zero routines or habits
    if (habits.length > 0 || isSeedingRef.current || seeding) return;

    isSeedingRef.current = true;
    setSeeding(true);
    try {
      await seedHabits();
      addToast('Foundation routines loaded successfully!', 'success');
    } catch (err) {
      console.error('Error loading foundation routines:', err);
      addToast(err.message || 'Failed to load recommended routines. Please try again.', 'error');
    } finally {
      isSeedingRef.current = false;
      setSeeding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <TopNav title="Routine Manager" subtitle="Life Areas & Scheduling" />

      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5">
        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-surface rounded-2xl border border-subtle shadow-2xs space-y-4">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center mx-auto text-teal-700 dark:text-teal-400 shadow-2xs">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-main">No routines found</h3>
              <p className="text-xs text-sub leading-relaxed">
                Load recommended foundation routines or create your own custom habit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
              <button
                type="button"
                onClick={handleSeedHabits}
                disabled={seeding}
                className="px-5 py-2.5 bg-teal-700 dark:bg-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-2xs"
              >
                {seeding ? 'Loading Routines...' : 'Load Recommended Routines'}
              </button>
              <button
                type="button"
                onClick={() => { setEditingHabit(null); setShowModal(true); }}
                className="px-5 py-2.5 bg-surface border border-subtle text-main rounded-xl text-xs sm:text-sm font-semibold hover:bg-surface-subtle transition-colors shadow-2xs"
              >
                Create Custom Routine
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const config = getCategoryConfig(habit.category);
              const timingText = getTimingDisplay(habit);
              const isPersonal = habit.seedOrigin === 'personal_preset' || habit.stableKey?.startsWith('canonical_');
              const isFoundation = !isPersonal && Boolean(habit.stableKey || habit.isSystemSeed);

              return (
                <div
                  key={habit.id}
                  className="bg-surface rounded-2xl p-4 sm:p-5 shadow-2xs border border-subtle hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                          {habit.category}
                        </span>

                        <span className="flex items-center gap-1 text-2xs text-sub bg-surface-subtle border border-subtle px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {timingText}
                        </span>

                        {isPersonal && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                            Personal
                          </span>
                        )}

                        {isFoundation && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-sub border border-subtle">
                            Foundation
                          </span>
                        )}

                        <span className="text-2xs text-muted">#{habit.order}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-main">
                        {habit.title}
                      </h3>

                      {habit.instructions && (
                        <p className="text-xs text-sub mt-1 line-clamp-2 leading-relaxed">
                          {habit.instructions}
                        </p>
                      )}

                      {/* Frequency badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {habit.frequency?.map(day => (
                          <span
                            key={day}
                            className="text-2xs px-2 py-0.5 bg-surface-subtle border border-subtle/60 text-sub rounded-md font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>

                      {habit.checklistItems?.length > 0 && (
                        <p className="text-2xs text-teal-700 dark:text-teal-400 font-medium mt-2">
                          {habit.checklistItems.length} checklist steps configured
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingHabit(habit); setShowModal(true); }}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl transition-colors"
                        title="Edit Routine"
                        aria-label={`Edit ${habit.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(habit.id)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                        title="Delete Routine"
                        aria-label={`Delete ${habit.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Routine?"
        message="This routine will be removed from your upcoming schedule. Historical logs and past completions are safely preserved."
        confirmText="Delete Routine"
        isDanger={true}
        isLoading={isDeleting}
      />

      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onDelete={editingHabit ? handleDelete : null}
        />
      )}

      {/* Floating Add Routine Button */}
      <div className="fixed bottom-20 left-0 right-3 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-4 flex justify-end">
          <button
            onClick={() => { setEditingHabit(null); setShowModal(true); }}
            className="w-13 h-13 min-w-[52px] min-h-[52px] bg-teal-700 dark:bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-800 dark:hover:bg-teal-500 transition-all hover:scale-105 flex items-center justify-center pointer-events-auto shadow-teal-700/30"
            aria-label="Add Routine"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
