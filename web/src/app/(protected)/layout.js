'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav, LoadingSpinner } from '@/components/ui';

/**
 * Layout for all authenticated routes.
 * Redirects to home if not logged in. Renders BottomNav for all child pages.
 */
export default function ProtectedLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {children}
            <BottomNav />
        </div>
    );
}
