'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  isMounted: false,
});

const THEME_STORAGE_KEY = 'vritta-theme';

const emptySubscribe = () => () => {};

/**
 * Safely retrieve theme preference from localStorage.
 * Restricts values strictly to 'light' and 'dark'.
 * Safely converts legacy 'system' preference, missing values, or invalid strings to 'light'.
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') {
      return 'dark';
    }
  } catch {
    // Graceful fallback if localStorage is disabled or throws security error
  }
  return 'light';
}

/**
 * Apply or remove the .dark class on document.documentElement
 */
export function applyThemeClass(resolved) {
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
      applyThemeClass(newStored);
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    themeListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
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

  // Subscribe to theme store with localStorage and cross-tab storage sync
  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => 'light'
  );

  // In two-state model, resolvedTheme is theme once mounted, default 'light' during SSR
  const resolvedTheme = isMounted ? theme : 'light';

  // Synchronize DOM class on mount and theme changes
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  // Update theme with localStorage persistence and DOM class sync
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable or disabled
    }

    applyThemeClass(newTheme);
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
