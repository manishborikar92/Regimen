'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useData, useToast } from '@/contexts';
import { TopNav, ConfirmDialog } from '@/components/ui';
import { HabitModal } from '@/components/habits';
import { seedHabits as seedData } from '@/lib/seed-data';
import { getCategoryConfig } from '@/lib/constants/categories';

export default function HabitsPage() {
    const { habits, addHabit, updateHabit, deleteHabit, seedHabits } = useData();
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
            addToast(`Habit ${editingHabit ? 'updated' : 'added'} successfully`, 'success');
        } catch (err) {
            console.error('Error saving habit:', err);
            addToast('Failed to save habit. Please try again.', 'error');
        }
    };

    const handleDelete = async (habitId) => {
        setIsDeleting(true);
        try {
            await deleteHabit(habitId);
            setShowModal(false);
            setEditingHabit(null);
            setDeleteConfirm(null);
            addToast('Habit deleted', 'success');
        } catch (err) {
            console.error('Error deleting habit:', err);
            addToast('Failed to delete habit. Please try again.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSeedHabits = async () => {
        setSeeding(true);
        try {
            await seedHabits(seedData);
            addToast('Sample routine loaded successfully!', 'success');
        } catch (err) {
            addToast(err.message || 'Failed to load sample routine.', 'error');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <>
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
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryConfig(habit.category).badgeClasses}`}>
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
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(habit.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Delete Habit?"
                message="This action cannot be undone."
                confirmText="Delete"
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

            {/* Floating Add Button */}
            <div className="fixed bottom-22 left-0 right-3 pointer-events-none z-40">
                <div className="max-w-2xl mx-auto px-4 flex justify-end">
                    <button
                        onClick={() => { setEditingHabit(null); setShowModal(true); }}
                        className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center pointer-events-auto"
                        aria-label="Add Habit"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </>
    );
}
