'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BottomNav, TopNav, LoadingSpinner } from '@/components/ui';
import { HabitModal } from '@/components/habits';
import { seedHabits as seedData } from '@/lib/seedData';

const categoryColors = {
  Movement: 'bg-blue-100 text-blue-700 border-blue-200',
  Nutrition: 'bg-green-100 text-green-700 border-green-200',
  Recovery: 'bg-purple-100 text-purple-700 border-purple-200',
  Schedule: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function HabitsPage() {
  const { user, loading: authLoading } = useAuth();
  const { habits, loading: dataLoading, addHabit, updateHabit, deleteHabit, seedHabits } = useData();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSave = async (formData) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData);
      } else {
        await addHabit(formData);
      }
      setShowModal(false);
      setEditingHabit(null);
    } catch (err) {
      console.error('Error saving habit:', err);
      alert('Failed to save habit. Please try again.');
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await deleteHabit(habitId);
      setShowModal(false);
      setEditingHabit(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleSeedHabits = async () => {
    setSeeding(true);
    try {
      await seedHabits(seedData);
      alert('Sample routine loaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to load sample routine.');
    } finally {
      setSeeding(false);
    }
  };

  const loading = authLoading || dataLoading;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopNav title="Manage Habits" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">No habits yet. Create your first one!</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => { setEditingHabit(null); setShowModal(true); }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Habit
              </button>
              <span className="text-gray-400 text-sm">or</span>
              <button
                onClick={handleSeedHabits}
                disabled={seeding}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {seeding ? 'Loading...' : 'Load Sample Routine'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500">{habit.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[habit.category]}`}>
                        {habit.category}
                      </span>
                      <span className="text-xs text-gray-400">#{habit.order}</span>
                    </div>
                    <h3 className="font-bold text-gray-900">{habit.title}</h3>
                    {habit.instructions && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{habit.instructions}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {habit.frequency?.map(day => (
                        <span key={day} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {day}
                        </span>
                      ))}
                    </div>
                    {habit.checklistItems?.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {habit.checklistItems.length} checklist items
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => { setEditingHabit(habit); setShowModal(true); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(habit.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Habit?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onDelete={editingHabit ? handleDelete : null}
        />
      )}

      {/* Floating Add Button - Positioned within max-w-2xl container */}
      <div className="fixed bottom-22 left-0 right-3 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-4 flex justify-end">
          <button
            onClick={() => { setEditingHabit(null); setShowModal(true); }}
            className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center pointer-events-auto"
            aria-label="Add Habit"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
