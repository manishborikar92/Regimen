'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  isMounted: false,
});

const THEME_STORAGE_KEY = 'vritta-theme';

const emptySubscribe = () => () => {};

/**
 * Safely retrieve theme preference from localStorage.
 * Falls back to 'system' on SSR or if localStorage throws/is disabled.
 */
function getStoredTheme() {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // Graceful fallback if localStorage is disabled or throws security error
  }
  return 'system';
}

/**
 * Check operating system color scheme preference.
 */
function getSystemPreference() {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Apply or remove the .dark class on document.documentElement
 */
function applyThemeClass(resolved) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Global subscribers set for theme changes
const themeListeners = new Set();
function notifyThemeListeners() {
  for (const listener of themeListeners) {
    listener();
  }
}

function subscribeTheme(callback) {
  themeListeners.add(callback);

  // Cross-tab synchronization via storage event
  const handleStorage = (e) => {
    if (e.key === THEME_STORAGE_KEY) {
      const newStored = getStoredTheme();
      const resolved = newStored === 'system' ? getSystemPreference() : newStored;
      applyThemeClass(resolved);
      callback();
    }
  };

  // OS theme change listener
  let mediaQuery;
  const handleMediaChange = () => {
    if (getStoredTheme() === 'system') {
      applyThemeClass(getSystemPreference());
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }
  }

  return () => {
    themeListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      if (mediaQuery) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleMediaChange);
        }
      }
    }
  };
}

export function ThemeProvider({ children }) {
  // isMounted tracking via standard React external store pattern (false on SSR, true on client)
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Subscribe to theme store with localStorage and cross-tab/OS events
  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => 'system'
  );

  // Compute resolvedTheme
  const resolvedTheme = useMemo(() => {
    if (!isMounted) return 'light';
    return theme === 'system' ? getSystemPreference() : theme;
  }, [theme, isMounted]);

  // Synchronize DOM class on mount and theme changes (DOM mutation effect without setState)
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  // Update theme with localStorage persistence and DOM class sync
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark' && newTheme !== 'system') return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable or disabled
    }

    const resolved = newTheme === 'system' ? getSystemPreference() : newTheme;
    applyThemeClass(resolved);
    notifyThemeListeners();
  }, []);

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    isMounted,
  }), [theme, resolvedTheme, setTheme, isMounted]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
