'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { unlockAudio } from '@/utils/audio-chime';
import { requestNotificationPermission, sendTimerNotification } from '@/utils/timer-notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useSound } from '@/contexts/SoundContext';

const STORAGE_KEY = 'vritta_active_timers';
const TimerContext = createContext(null);

/**
 * Creates an inline Web Worker ticker to bypass background tab setInterval throttling (which browsers throttle to >= 1000ms or 60s).
 */
function createTimerWorker() {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  try {
    const workerScript = `
      let intervalId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!intervalId) {
            intervalId = setInterval(function() {
              self.postMessage('tick');
            }, 500);
          }
        } else if (e.data === 'stop') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      };
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker.cleanup = () => {
      try {
        worker.terminate();
        URL.revokeObjectURL(url);
      } catch {}
    };
    return worker;
  } catch {
    return null;
  }
}

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
        const diffMs = t.targetEndTime - now;
        if (diffMs <= 0) {
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
            secondsRemaining: Math.ceil(diffMs / 1000),
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
  const deadlineTimeoutsRef = useRef({});
  const completedSessionsRef = useRef({});
  const workerRef = useRef(null);

  const { user, loading: authLoading } = useAuth() || {};
  const { updateProgress, todayLog, toggleHabit } = useData() || {};
  const {
    playStartCue,
    playPauseCue,
    playResumeCue,
    playResetCue,
    playCompletionCue,
  } = useSound();

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

  // Handle reload recovery once auth is fully resolved if any running timer expired while the app was closed
  useEffect(() => {
    if (authLoading) return;

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
  }, [authLoading, handleTimerFinished, saveToStorage]);

  // Reusable tick and sync execution function
  const tickTimers = useCallback(() => {
    const now = Date.now();
    const finishedTimers = [];

    setTimers((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      Object.entries(prev).forEach(([id, t]) => {
        if (!t.isRunning || !t.targetEndTime) return;

        const diffMs = t.targetEndTime - now;

        if (diffMs <= 0) {
          // Idempotent session key guard against duplicate completion execution
          const sessionKey = `${id}_${t.targetEndTime}`;
          if (!completedSessionsRef.current[sessionKey] && !finishingTimersRef.current.has(id)) {
            completedSessionsRef.current[sessionKey] = true;
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
        } else {
          const remaining = Math.ceil(diffMs / 1000);
          if (remaining !== t.secondsRemaining) {
            hasChanges = true;
            next[id] = {
              ...t,
              secondsRemaining: remaining,
            };
          }
        }
      });

      if (hasChanges) {
        saveToStorage(next);
      }

      return hasChanges ? next : prev;
    });

    // Execute completions outside the setState updater to maintain pure functional state updates
    finishedTimers.forEach(({ habitId, targetMinutes }) => {
      if (deadlineTimeoutsRef.current[habitId]) {
        clearTimeout(deadlineTimeoutsRef.current[habitId]);
        delete deadlineTimeoutsRef.current[habitId];
      }
      handleTimerFinished(habitId, targetMinutes, false);
      finishingTimersRef.current.delete(habitId);
    });
  }, [handleTimerFinished, saveToStorage]);

  // Schedule exact target deadline timeouts for active timers to guarantee prompt execution under background throttling
  useEffect(() => {
    Object.entries(timers).forEach(([id, t]) => {
      if (t.isRunning && t.targetEndTime) {
        if (!deadlineTimeoutsRef.current[id]) {
          const delay = Math.max(0, t.targetEndTime - Date.now());
          deadlineTimeoutsRef.current[id] = setTimeout(() => {
            delete deadlineTimeoutsRef.current[id];
            tickTimers();
          }, delay);
        }
      } else if (deadlineTimeoutsRef.current[id]) {
        clearTimeout(deadlineTimeoutsRef.current[id]);
        delete deadlineTimeoutsRef.current[id];
      }
    });
  }, [timers, tickTimers]);

  // Initialize Web Worker ticker for background tab heartbeat (immune to DOM timer budget clamping)
  useEffect(() => {
    workerRef.current = createTimerWorker();
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        if (e.data === 'tick') {
          tickTimers();
        }
      };
    }
    return () => {
      if (workerRef.current?.cleanup) {
        workerRef.current.cleanup();
      }
    };
  }, [tickTimers]);

  // Manage worker heartbeat & fallback DOM interval based on active timers
  useEffect(() => {
    const hasRunningTimers = Object.values(timers).some((t) => t.isRunning);
    if (!hasRunningTimers) {
      if (workerRef.current) {
        workerRef.current.postMessage('stop');
      }
      return;
    }

    if (workerRef.current) {
      workerRef.current.postMessage('start');
    }

    // Fallback standard interval in case Web Worker is blocked or unsupported
    const intervalId = setInterval(tickTimers, 500);
    return () => clearInterval(intervalId);
  }, [timers, tickTimers]);

  // Synchronize on document visibility change, window focus, and bfcache pageshow
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = () => tickTimers();

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('pageshow', handleSync);

    return () => {
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('pageshow', handleSync);
    };
  }, [tickTimers]);

  // Start or resume a timer for a specific habit
  const startTimer = useCallback((habitId, durationMinutes = 30) => {
    finishingTimersRef.current.delete(habitId);
    if (deadlineTimeoutsRef.current[habitId]) {
      clearTimeout(deadlineTimeoutsRef.current[habitId]);
      delete deadlineTimeoutsRef.current[habitId];
    }
    unlockAudio();
    requestNotificationPermission().catch(() => {});

    setTimers((prev) => {
      const current = prev[habitId];

      // If timer is already actively running, avoid duplicate triggers or audio cues
      if (current?.isRunning) {
        return prev;
      }

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

      // Play resume cue when resuming a paused session; play start cue on fresh start
      if (isResuming) {
        playResumeCue?.();
      } else {
        playStartCue?.();
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
  }, [saveToStorage, playStartCue, playResumeCue]);

  // Pause a running timer
  const pauseTimer = useCallback((habitId) => {
    finishingTimersRef.current.delete(habitId);
    if (deadlineTimeoutsRef.current[habitId]) {
      clearTimeout(deadlineTimeoutsRef.current[habitId]);
      delete deadlineTimeoutsRef.current[habitId];
    }

    setTimers((prev) => {
      const current = prev[habitId];
      if (!current || !current.isRunning) return prev;

      playPauseCue?.();

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
  }, [saveToStorage, playPauseCue]);

  // Reset a timer back to full target duration (only plays if timer was actually active or paused mid-session)
  const resetTimer = useCallback((habitId, fallbackMinutes = 30) => {
    finishingTimersRef.current.delete(habitId);
    if (deadlineTimeoutsRef.current[habitId]) {
      clearTimeout(deadlineTimeoutsRef.current[habitId]);
      delete deadlineTimeoutsRef.current[habitId];
    }

    setTimers((prev) => {
      const current = prev[habitId];
      const canReset = current && (
        current.isRunning ||
        (current.isPaused && typeof current.secondsRemaining === 'number' && current.secondsRemaining < current.targetSeconds)
      );

      if (!canReset) {
        return prev;
      }

      playResetCue?.();

      const next = { ...prev };
      delete next[habitId];
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage, playResetCue]);

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

  // Helper to get state of a timer with default fallback and real-time millisecond calculation
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

    let secondsRemaining = targetSeconds;
    if (isRunning && current?.targetEndTime) {
      const diffMs = current.targetEndTime - Date.now();
      secondsRemaining = diffMs <= 0 ? 0 : Math.ceil(diffMs / 1000);
    } else if (isPaused && typeof current?.secondsRemaining === 'number') {
      secondsRemaining = current.secondsRemaining;
    }

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

