'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, Activity, Headphones, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner, Logo } from '@/components/ui';
import { BRAND } from '@/lib/constants/brand';

const features = [
  {
    Icon: BookOpen,
    title: 'Word Power Made Easy',
    description: 'Track your two daily vocabulary sessions with prior-day revision.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    Icon: Activity,
    title: '12-Week Movement Plan',
    description: 'Strength on M/W/F, easy walks on T/Th/Sa, and protected Sunday rest.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    Icon: Headphones,
    title: '30-Discourse Osho Library',
    description: 'Explore contemplative discourses with daily listening separated from series progress.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    Icon: Lock,
    title: 'Private & Local-First',
    description: 'Your diary reflections and progress remain private on your account with offline support.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <LoadingSpinner />;
  }

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center mb-10">
          <div className="flex justify-center mb-6 relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-indigo-300 blur-2xl opacity-25 rounded-full w-24 h-24 mx-auto animate-pulse" />
            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl relative z-10 p-3.5 border border-indigo-100/90 flex items-center justify-center">
              <Logo className="w-full h-full" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
            {BRAND.name}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 font-medium tracking-wide mb-8 max-w-sm mx-auto leading-relaxed">
            {BRAND.shortDescription}
          </p>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xs"
          >
            {signingIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-indigo-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span className="text-gray-800 font-semibold text-sm">
              {signingIn ? 'Signing in...' : 'Continue with Google'}
            </span>
            {!signingIn && (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          <p className="text-2xs text-gray-400 mt-3 font-medium">
            Private & Offline-Capable • No Subscription Required
          </p>
        </div>

        {/* Feature Grid */}
        <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2">
          {features.map(({ Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className={`p-2 rounded-xl ${bg} flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{title}</h3>
                <p className="text-gray-500 text-2xs sm:text-xs mt-0.5 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-2xs text-gray-400">
        <p>{BRAND.name} — {BRAND.tagline}</p>
      </footer>
    </div>
  );
}
