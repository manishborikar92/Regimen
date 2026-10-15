'use client';

import { useState, useRef } from 'react';
import { Plus, Compass } from 'lucide-react';
import { useData, useToast } from '@/contexts';
import { TopNav, ConfirmDialog, LoadingSpinner } from '@/components/ui';
import { HabitModal, RoutineCard } from '@/components/habits';

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

      <main className="max-w-2xl mx-auto px-4 py-5 sm:py-6 space-y-5 pb-32 sm:pb-36">
        {habits.length === 0 ? (
          <div className="text-center py-12 px-4 bg-surface rounded-2xl border border-subtle dark:border-stone-800 shadow-2xs space-y-4">
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
                className="px-5 py-2.5 bg-surface border border-subtle dark:border-stone-700 text-main rounded-xl text-xs sm:text-sm font-semibold hover:bg-surface-subtle transition-colors shadow-2xs"
              >
                Create Custom Routine
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <RoutineCard
                key={habit.id}
                habit={habit}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setShowModal(true);
                }}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))}
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

      {/* Floating Add Routine Button — elevated above BottomNav with zero card collision */}
      <div className="fixed bottom-22 sm:bottom-24 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-4 flex justify-end">
          <button
            type="button"
            onClick={() => { setEditingHabit(null); setShowModal(true); }}
            className="w-13 h-13 min-w-[52px] min-h-[52px] bg-teal-700 dark:bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-800 dark:hover:bg-teal-500 transition-all hover:scale-105 active:scale-95 flex items-center justify-center pointer-events-auto shadow-teal-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            aria-label="Add Routine"
            title="Add Routine"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
