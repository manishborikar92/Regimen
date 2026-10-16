'use client';

import { createContext, useContext, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  playStartCue as synthStartCue,
  playCompletionChime as synthCompletionChime,
  isAudioSupported,
} from '@/utils/audio-chime';

const SOUND_ENABLED_KEY = 'vritta-sound-enabled';
const DEFAULT_ENABLED = true;

const SoundContext = createContext({
  soundEnabled: DEFAULT_ENABLED,
  isMounted: false,
  isSupported: true,
  setSoundEnabled: () => {},
  toggleSound: () => {},
  playStartCue: () => false,
  playCompletionCue: () => false,
});

const emptySubscribe = () => () => {};

/**
 * Safely retrieve sound-enabled preference from localStorage.
 * Defaults to true if unconfigured.
 * @returns {boolean}
 */
export function getStoredSoundEnabled() {
  if (typeof window === 'undefined') return DEFAULT_ENABLED;
  try {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    if (stored === null) return DEFAULT_ENABLED;
    return stored === 'true';
  } catch {
    return DEFAULT_ENABLED;
  }
}

// Global subscribers set for sound preference changes
const soundListeners = new Set();
function notifySoundListeners() {
  for (const listener of soundListeners) {
    listener();
  }
}

function subscribeSound(callback) {
  soundListeners.add(callback);

  const handleStorage = (e) => {
    if (e.key === SOUND_ENABLED_KEY) {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    soundListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

/**
 * SoundProvider — Centralized audio preference and dispatch manager.
 * Mounted high in the provider hierarchy above TimerProvider.
 */
export function SoundProvider({ children }) {
  // SSR-safe mount tracking
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getStoredSoundEnabled,
    () => DEFAULT_ENABLED
  );

  const isSupported = useMemo(() => isAudioSupported(), []);

  const setSoundEnabled = useCallback((enabled) => {
    const nextVal = Boolean(enabled);
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, String(nextVal));
    } catch {
      // Storage unavailable or disabled
    }
    notifySoundListeners();
  }, []);

  // Direct toggle (does not play audio on click)
  const toggleSound = useCallback(() => {
    const current = getStoredSoundEnabled();
    const nextVal = !current;
    try {
      localStorage.setItem(SOUND_ENABLED_KEY, String(nextVal));
    } catch {
      // Storage unavailable or disabled
    }
    notifySoundListeners();
  }, []);

  // Standard cue dispatches (respects mute setting)
  const playStart = useCallback(() => {
    if (!soundEnabled) return false;
    return synthStartCue();
  }, [soundEnabled]);

  const playCompletion = useCallback(() => {
    if (!soundEnabled) return false;
    return synthCompletionChime();
  }, [soundEnabled]);

  const value = useMemo(() => ({
    soundEnabled,
    isMounted,
    isSupported,
    setSoundEnabled,
    toggleSound,
    playStartCue: playStart,
    playCompletionCue: playCompletion,
  }), [
    soundEnabled,
    isMounted,
    isSupported,
    setSoundEnabled,
    toggleSound,
    playStart,
    playCompletion,
  ]);

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  return context;
}
