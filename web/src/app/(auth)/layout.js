'use client';

/**
 * Layout for authentication routes (login, etc.)
 * Minimal layout without BottomNav.
 */
export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {children}
        </div>
    );
}
