'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Flame, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui';

const features = [
    {
        Icon: CheckCircle,
        title: 'Track Habits',
        description: 'Create and manage your daily routine with a simple, focused interface.',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
    },
    {
        Icon: Flame,
        title: 'Build Streaks',
        description: 'Stay motivated with streak tracking that rewards your consistency.',
        color: 'text-orange-500',
        bg: 'bg-orange-50',
    },
    {
        Icon: BarChart3,
        title: 'View Analytics',
        description: 'See your progress with calendar heatmaps and per-habit performance stats.',
        color: 'text-purple-500',
        bg: 'bg-purple-50',
    },
    {
        Icon: Shield,
        title: 'Private & Secure',
        description: 'Your data is yours. Synced via Firebase with offline support.',
        color: 'text-green-500',
        bg: 'bg-green-50',
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
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center mb-10">
                    <div className="flex justify-center mb-8 relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 rounded-full w-24 h-24 mx-auto animate-pulse"></div>
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300 relative z-10">
                            <img src="/logo.svg" alt="Regimen Logo" className="w-10 h-10" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 tracking-tight leading-tight">
                        Regimen
                    </h1>

                    <p className="text-lg text-gray-500 font-medium tracking-wide mb-10 max-w-[280px] mx-auto">
                        Track habits, build streaks, and reclaim your routine.
                    </p>

                    {/* Sign In Button */}
                    <button
                        onClick={handleSignIn}
                        disabled={signingIn}
                        className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {signingIn ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span className="text-gray-700 font-medium">
                            {signingIn ? 'Signing in...' : 'Continue with Google'}
                        </span>
                        {!signingIn && (
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                        )}
                    </button>

                    <p className="text-xs text-gray-400 mt-4">
                        Free forever • No credit card required
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                    {features.map(({ Icon, title, description, color, bg }) => (
                        <div
                            key={title}
                            className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                        >
                            <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-6 text-xs text-gray-400">
                <p>Regimen — Daily Routine Tracker</p>
            </footer>
        </div>
    );
}
