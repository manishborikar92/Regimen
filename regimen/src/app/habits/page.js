'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import BottomNav from '@/components/BottomNav';
import HabitModal from '@/components/HabitModal';
import { seedHabits as seedData } from '@/lib/seedData';

const categoryColors = {
  Movement: 'bg-blue-100 text-blue-700 border-blue-200',
  Nutrition: 'bg-green-100 text-green-700 border-green-200',
  Recovery: 'bg-purple-100 text-purple-700 border-purple-200',
  Schedule: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function HabitsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const habitsRef = collection(db, 'habits');
      const habitsQuery = query(habitsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(habitsQuery);
      const habitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      habitsData.sort((a, b) => a.order - b.order);
      setHabits(habitsData);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    console.log('Current User ID:', user.uid); // Debug log
    fetchHabits();
  }, [user, fetchHabits]);

  const handleSave = async (formData) => {
    try {
      if (editingHabit) {
        await updateDoc(doc(db, 'habits', editingHabit.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'habits'), {
          ...formData,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      await fetchHabits();
      setShowModal(false);
      setEditingHabit(null);
    } catch (err) {
      console.error('Error saving habit:', err);
      alert('Failed to save habit. Please try again.');
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
      await fetchHabits();
      setShowModal(false);
      setEditingHabit(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting habit:', err);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingHabit(null);
    setShowModal(true);
  };

  const handleSeedHabits = async () => {
    setSeeding(true);
    const habitsRef = collection(db, 'habits');

    try {
      // Step 1: Check existing habits (READ)
      console.log('Checking for existing habits...');
      const habitsQuery = query(habitsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(habitsQuery);
      
      if (!snapshot.empty) {
        alert('You already have habits! Delete them first if you want to re-seed.');
        setSeeding(false);
        return;
      }
    } catch (err) {
      console.error('Error reading habits (Permission/Network):', err);
      alert('Error reading database. Please check your internet or Firebase Rules.');
      setSeeding(false);
      return;
    }

    try {
      // Step 2: Seed habits (WRITE)
      console.log('Seeding habits for user:', user.uid);
      const promises = seedData.map(habit => 
        addDoc(habitsRef, {
          ...habit,
          userId: user.uid,
          createdAt: serverTimestamp()
        })
      );

      await Promise.all(promises);
      console.log('Seeding complete.');
      await fetchHabits();
      alert('Sample routine loaded successfully!');
    } catch (err) {
      console.error('Error creating habits (Permission Denied?):', err);
      alert('Failed to create habits. This is likely a Permissions error. Please update your Firestore Rules in the Firebase Console.');
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Manage Habits</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">No habits yet. Create your first one!</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={openAdd}
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
                      onClick={() => openEdit(habit)}
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

      {/* Delete Confirmation Modal */}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
          onDelete={editingHabit ? handleDelete : null}
        />
      )}

      <BottomNav />
    </div>
  );
}
