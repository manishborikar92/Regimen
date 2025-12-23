'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav, LoadingSpinner } from '@/components/ui';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <TopNav title="Routine Tracker" />
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Track Your Daily Routine
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Build better habits, one day at a time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Habits</h3>
            <p className="text-gray-600 text-sm">
              Create and manage your daily habits with ease
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Streaks</h3>
            <p className="text-gray-600 text-sm">
              Stay motivated with streak tracking and progress visualization
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-gray-600 text-sm">
              Analyze your progress with detailed statistics and insights
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Sign in with Google to get started
          </p>
          <p className="text-sm text-gray-500">
            Free forever • No credit card required
          </p>
        </div>
      </main>
    </div>
  );
}
