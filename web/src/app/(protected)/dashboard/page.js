'use client';

import { useData } from '@/contexts/DataContext';
import { HabitCard, HabitAccordion, StreakCounter } from '@/components/habits';
import { TopNav } from '@/components/ui';
import { formatDate } from '@/utils/date-helpers';

export default function DashboardPage() {
    const { todaysHabits, todayLog, todayStats, error, toggleHabit } = useData();

    return (
        <>
            <TopNav title="Regimen" subtitle={formatDate()} />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <StreakCounter />

                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Today&apos;s Progress</span>
                        <span className="text-sm font-bold text-blue-600">
                            {todayStats.completed} of {todayStats.total} completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${todayStats.percentage}%` }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    {todaysHabits.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No habits scheduled for today.</p>
                            <p className="text-sm mt-2">Enjoy your rest day! 🎉</p>
                        </div>
                    ) : (
                        todaysHabits.map((habit) => {
                            const isCompleted = todayLog.includes(habit.id);
                            const hasChecklist = habit.checklistItems?.length > 0;

                            return hasChecklist ? (
                                <HabitAccordion
                                    key={habit.id}
                                    habit={habit}
                                    isCompleted={isCompleted}
                                    onToggle={toggleHabit}
                                />
                            ) : (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    isCompleted={isCompleted}
                                    onToggle={toggleHabit}
                                />
                            );
                        })
                    )}
                </div>
            </main>
        </>
    );
}
