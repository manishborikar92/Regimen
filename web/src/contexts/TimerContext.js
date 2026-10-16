'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { unlockAudio } from '@/utils/audio-chime';
import { requestNotificationPermission, sendTimerNotification } from '@/utils/timer-notifications';
import { useData } from '@/contexts/DataContext';
import { useSound } from '@/contexts/SoundContext';

const STORAGE_KEY = 'vritta_active_timers';
const TimerContext = createContext(null);

function getInitialTimers() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    const restored = {};
    const now = Date.now();

    Object.entries(parsed).forEach(([id, t]) => {
      if (!t || !t.targetMinutes) return;

      const targetSeconds = t.targetSeconds || t.targetMinutes * 60;

      if (t.isRunning && t.targetEndTime) {
        const remaining = Math.max(0, Math.ceil((t.targetEndTime - now) / 1000));
        if (remaining <= 0) {
          // Timer expired while the browser was closed
          restored[id] = {
            ...t,
            expiredWhileAway: true,
            secondsRemaining: 0,
            isRunning: false,
            isPaused: false,
            targetEndTime: null,
          };
        } else {
          // Timer is still active
          restored[id] = {
            ...t,
            secondsRemaining: remaining,
            targetSeconds,
            isRunning: true,
            isPaused: false,
          };
        }
      } else if (t.isPaused && typeof t.secondsRemaining === 'number' && t.secondsRemaining > 0 && t.secondsRemaining < targetSeconds) {
        restored[id] = {
          ...t,
          targetSeconds,
          isRunning: false,
          isPaused: true,
        };
      }
    });

    return restored;
  } catch {
    return {};
  }
}

/**
 * TimerProvider — Global persistent timer manager for specialized routines.
 */
export function TimerProvider({ children }) {
  const [timers, setTimers] = useState(getInitialTimers);
  const callbacksRef = useRef({});
  const finishingTimersRef = useRef(new Set());
  const { updateProgress, todayLog, toggleHabit } = useData() || {};
  const { playStartCue, playCompletionCue } = useSound();

  // Save active timers state to localStorage (omits finished timers to prevent repeated re-alerting)
  const saveToStorage = useCallback((updatedTimers) => {
    if (typeof window === 'undefined') return;
    try {
      const serializable = {};
      Object.entries(updatedTimers).forEach(([id, t]) => {
        // Persist only active countdowns or paused mid-session timers
        if (t.isRunning || (t.isPaused && t.secondsRemaining > 0 && t.secondsRemaining < t.targetSeconds)) {
          serializable[id] = {
            habitId: t.habitId,
            targetMinutes: t.targetMinutes,
            targetSeconds: t.targetSeconds,
            secondsRemaining: t.secondsRemaining,
            targetEndTime: t.targetEndTime,
            isRunning: t.isRunning,
            isPaused: t.isPaused,
          };
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage write errors (e.g. storage disabled or quota exceeded)
    }
  }, []);

  // Single authoritative completion handler for a finished timer session
  const handleTimerFinished = useCallback((habitId, targetMinutes, isSilent = false) => {
    if (!isSilent && playCompletionCue) {
      playCompletionCue();
    }

    if (typeof document !== 'undefined' && document.hidden) {
      sendTimerNotification(
        'Reading Session Finished',
        `You completed your ${targetMinutes}-minute reading session!`,
        `vritta-timer-${habitId}`
      );
    }

    // Authoritative single-point write to Firestore
    if (updateProgress) {
      updateProgress(habitId, { durationMinutes: targetMinutes }, true);
    } else if (toggleHabit && todayLog && !todayLog.includes(habitId)) {
      toggleHabit(habitId);
    }

    // Notify registered component listeners (e.g. local UI toast or animation)
    const registered = callbacksRef.current[habitId];
    if (registered?.onFinish) {
      registered.onFinish({ habitId, targetMinutes });
    }
  }, [playCompletionCue, updateProgress, toggleHabit, todayLog]);

  // Handle reload recovery once on mount if any running timer expired while the app was closed
  useEffect(() => {
    const initial = getInitialTimers();
    let hasExpired = false;

    Object.entries(initial).forEach(([id, t]) => {
      if (t.expiredWhileAway) {
        hasExpired = true;
        handleTimerFinished(id, t.targetMinutes, true /* isSilent: strictly silent on reload recovery */);
      }
    });

    if (hasExpired) {
      // Clean up localStorage immediately so reload recovery does not repeat
      saveToStorage(initial);
    }
  }, [handleTimerFinished, saveToStorage]);

  // Reusable tick and sync execution function
  const tickTimers = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;
    const finishedTimers = [];

    setTimers((prev) => {
      const next = { ...prev };

      Object.entries(prev).forEach(([id, t]) => {
        if (!t.isRunning || !t.targetEndTime) return;

        const remaining = Math.max(0, Math.ceil((t.targetEndTime - now) / 1000));

        if (remaining <= 0) {
          // Atomic guard against duplicate processing
          if (!finishingTimersRef.current.has(id)) {
            finishingTimersRef.current.add(id);
            hasChanges = true;
            next[id] = {
              ...t,
              secondsRemaining: 0,
              isRunning: false,
              isPaused: false,
              targetEndTime: null,
            };
            finishedTimers.push({ habitId: id, targetMinutes: t.targetMinutes });
          }
        } else if (remaining !== t.secondsRemaining) {
          hasChanges = true;
          next[id] = {
            ...t,
            secondsRemaining: remaining,
          };
        }
      });

      if (hasChanges) {
        saveToStorage(next);
      }

      return hasChanges ? next : prev;
    });

    finishedTimers.forEach(({ habitId, targetMinutes }) => {
      handleTimerFinished(habitId, targetMinutes);
      finishingTimersRef.current.delete(habitId);
    });
  }, [handleTimerFinished, saveToStorage]);

  // Unified background timer tick loop (every 500ms)
  useEffect(() => {
    const hasRunningTimers = Object.values(timers).some((t) => t.isRunning);
    if (!hasRunningTimers) return;

    const intervalId = setInterval(tickTimers, 500);
    return () => clearInterval(intervalId);
  }, [timers, tickTimers]);

  // Synchronize on document visibility change and tab focus with race-condition guard
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleSync = () => tickTimers();

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [tickTimers]);

  // Start or resume a timer for a specific habit
  const startTimer = useCallback((habitId, durationMinutes = 30) => {
    finishingTimersRef.current.delete(habitId);
    unlockAudio();
    requestNotificationPermission().catch(() => {});

    setTimers((prev) => {
      const current = prev[habitId];
      const targetMinutes = durationMinutes || current?.targetMinutes || 30;
      const targetSeconds = targetMinutes * 60;

      const isResuming = Boolean(
        current?.isPaused &&
        typeof current?.secondsRemaining === 'number' &&
        current.secondsRemaining > 0 &&
        current.secondsRemaining < targetSeconds
      );

      const currentRemaining = isResuming ? current.secondsRemaining : targetSeconds;
      const targetEndTime = Date.now() + currentRemaining * 1000;

      // Only genuinely new sessions play start cue
      if (!isResuming && playStartCue) {
        playStartCue();
      }

      const updated = {
        ...prev,
        [habitId]: {
          habitId,
          targetMinutes,
          targetSeconds,
          secondsRemaining: currentRemaining,
          targetEndTime,
          isRunning: true,
          isPaused: false,
        },
      };

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage, playStartCue]);

  // Pause a running timer (strictly silent)
  const pauseTimer = useCallback((habitId) => {
    setTimers((prev) => {
      const current = prev[habitId];
      if (!current || !current.isRunning) return prev;

      const remaining = current.targetEndTime
        ? Math.max(0, Math.ceil((current.targetEndTime - Date.now()) / 1000))
        : current.secondsRemaining;

      const updated = {
        ...prev,
        [habitId]: {
          ...current,
          secondsRemaining: remaining,
          targetEndTime: null,
          isRunning: false,
          isPaused: true,
        },
      };

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Reset a timer back to full target duration (strictly silent)
  const resetTimer = useCallback((habitId, fallbackMinutes = 30) => {
    finishingTimersRef.current.delete(habitId);

    setTimers((prev) => {
      const next = { ...prev };
      delete next[habitId];
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Adjust duration while timer is idle
  const setTimerDuration = useCallback((habitId, minutes) => {
    if (!minutes || minutes < 1) return;

    setTimers((prev) => {
      const current = prev[habitId];
      if (current?.isRunning) return prev;

      const targetSeconds = minutes * 60;
      const updated = {
        ...prev,
        [habitId]: {
          habitId,
          targetMinutes: minutes,
          targetSeconds,
          secondsRemaining: targetSeconds,
          targetEndTime: null,
          isRunning: false,
          isPaused: false,
        },
      };

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Register callback for active card
  const registerTimerCallback = useCallback((habitId, callbacks) => {
    callbacksRef.current[habitId] = callbacks;
    return () => {
      delete callbacksRef.current[habitId];
    };
  }, []);

  // Helper to get state of a timer with default fallback
  const getTimerState = useCallback((habitId, defaultMinutes = 30) => {
    const current = timers[habitId];
    const isRunning = Boolean(current?.isRunning);
    const isPaused = Boolean(current?.isPaused);

    // If running or paused mid-session, preserve active countdown target;
    // When idle, authoritative target duration comes directly from habit configuration (defaultMinutes).
    const targetMinutes = (isRunning || isPaused) && current?.targetMinutes
      ? current.targetMinutes
      : defaultMinutes;
    const targetSeconds = targetMinutes * 60;
    const secondsRemaining = isRunning || isPaused
      ? (typeof current?.secondsRemaining === 'number' ? current.secondsRemaining : targetSeconds)
      : targetSeconds;

    return {
      habitId,
      targetMinutes,
      targetSeconds,
      secondsRemaining,
      isRunning,
      isPaused,
      progressPercent: Math.min(100, Math.max(0, Math.round(((targetSeconds - secondsRemaining) / targetSeconds) * 100))),
    };
  }, [timers]);

  const value = {
    timers,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerDuration,
    registerTimerCallback,
    getTimerState,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimerContext() {
  return useContext(TimerContext);
}
