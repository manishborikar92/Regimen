'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND } from '@/lib/constants/brand';
import ConfirmDialog from './ConfirmDialog';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function TopNav({ title, subtitle }) {
  const { user, signInWithGoogle, logout } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayTitle = title || BRAND.name;

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="bg-surface/90 backdrop-blur-md border-b border-subtle sticky top-0 z-40 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface border border-subtle shadow-2xs flex items-center justify-center p-1 hover:shadow-xs transition-shadow">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-main tracking-tight leading-none">
                  {displayTitle}
                </h1>
                {title && title !== BRAND.name && (
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900 hidden sm:inline-block">
                    {BRAND.name}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-2xs sm:text-xs text-sub font-medium tracking-wide mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Accessible Icon-Only Light/Dark Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:bg-surface-subtle rounded-xl p-1.5 transition-colors border border-transparent hover:border-subtle"
                  aria-expanded={showProfileMenu}
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent-subtle/40 border border-subtle flex items-center justify-center text-xs font-bold text-accent">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      (user.displayName ? user.displayName[0] : 'U')
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-main leading-tight">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-2xs text-muted truncate max-w-[120px]">{user.email}</p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowProfileMenu(false)}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-subtle py-1.5 z-40"
                      role="menu"
                    >
                      <div className="px-3.5 py-2.5 border-b border-subtle">
                        <p className="text-xs font-bold text-main">{user.displayName || 'User'}</p>
                        <p className="text-2xs text-muted truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors disabled:opacity-50 text-xs font-semibold shadow-2xs"
              >
                {signingIn ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/40 border-t-white" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="Are you sure you want to sign out? Your offline and synced data remains securely saved on your account."
        confirmText="Sign Out"
        isDanger={true}
        isLoading={isLoggingOut}
      />
    </>
  );
}
