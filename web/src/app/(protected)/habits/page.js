'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Sparkles, RefreshCw, Compass, Clock } from 'lucide-react';
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
    // If the user's routines were seeded via CLI, protect them from accidental override
    const hasPersonalRoutines = habits.some(
      h => h.seedOrigin === 'personal_preset' || h.stableKey?.startsWith('canonical_')
    );
    if (hasPersonalRoutines) {
      addToast('Personal routines are managed via CLI: npm run schedule:fetch-personal', 'info');
      return;
    }

    setSeeding(true);
    try {
      await seedHabits();
      addToast('Foundation routines synced successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to sync foundation routines.', 'error');
    } finally {
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
        {/* Helper Banner */}
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-teal-50/50 p-4 rounded-2xl border border-indigo-100 flex items-start justify-between gap-3 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              Scheduling Philosophy
            </h3>
            <p className="text-2xs sm:text-xs text-gray-600 leading-relaxed max-w-lg">
              Preferred times are soft guidance, never hard deadlines. Categorize by life purpose and priority rather than rigid hours.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSeedHabits}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-2xs flex-shrink-0"
            title="Idempotently load or update foundation routines without deleting custom routines"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Syncing...' : 'Sync Routines'}</span>
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 text-2xl">
              📝
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">No routines found</h3>
              <p className="text-xs text-gray-500">
                Load recommended foundation routines or create your own custom habit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
              <button
                onClick={handleSeedHabits}
                disabled={seeding}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-2xs"
              >
                {seeding ? 'Loading Routines...' : 'Load Recommended Routines'}
              </button>
              <button
                onClick={() => { setEditingHabit(null); setShowModal(true); }}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
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
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                          {habit.category}
                        </span>

                        <span className="flex items-center gap-1 text-2xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {timingText}
                        </span>

                        {isPersonal && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            Personal
                          </span>
                        )}

                        {isFoundation && (
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Foundation
                          </span>
                        )}

                        <span className="text-2xs text-gray-400">#{habit.order}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        {habit.title}
                      </h3>

                      {habit.instructions && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {habit.instructions}
                        </p>
                      )}

                      {/* Frequency badges */}
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {habit.frequency?.map(day => (
                          <span
                            key={day}
                            className="text-2xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>

                      {habit.checklistItems?.length > 0 && (
                        <p className="text-2xs text-indigo-600 font-medium mt-2">
                          {habit.checklistItems.length} checklist steps configured
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 ml-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingHabit(habit); setShowModal(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Edit Routine"
                        aria-label={`Edit ${habit.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(habit.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
            className="w-13 h-13 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 flex items-center justify-center pointer-events-auto shadow-indigo-200"
            aria-label="Add Routine"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
