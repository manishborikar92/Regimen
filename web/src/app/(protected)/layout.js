'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TopNav, BottomNav, LoadingSpinner } from '@/components/ui';
import { BRAND } from '@/lib/constants/brand';
import { formatDate } from '@/utils/date-helpers';

/**
 * Layout for all authenticated routes (/dashboard, /habits, /analytics).
 *
 * Implements the shared application shell:
 * - Persistent TopNav header with route-aware title and subtitle
 * - Page content area ({children})
 * - Persistent BottomNav bottom navigation bar
 * - Calm, neutral branded loading state while authentication is unresolved
 * - Protected redirect to /login for unauthenticated visitors
 */
export default function ProtectedLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Derive route-specific header title and subtitle dynamically
    const headerInfo = useMemo(() => {
        if (pathname?.startsWith('/habits')) {
            return { title: 'Routine Manager', subtitle: 'Life Areas & Scheduling' };
        }
        if (pathname?.startsWith('/analytics')) {
            return { title: 'Insights & Consistency', subtitle: 'Supportive Rhythm Tracking' };
        }
        return { title: BRAND.name, subtitle: formatDate() };
    }, [pathname]);

    // Neutral branded loading state while authentication resolves (zero protected leak)
    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-canvas text-main transition-colors duration-200 pb-20">
            <TopNav title={headerInfo.title} subtitle={headerInfo.subtitle} />
            {children}
            <BottomNav />
        </div>
    );
}
