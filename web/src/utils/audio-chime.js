/**
 * Audio Chime Utility — Zero-dependency Web Audio API sound synthesizer.
 *
 * Provides calibrated synthesized auditory cues for specialized routines:
 * - playStartCue: Rising two-note interval (G4 -> C5) for focus initiation (0.35s)
 * - playCompletionChime: Resonant harmonic chord (C4, G4, 528Hz, 660Hz) with 2.0s decay
 *
 * Handles audio context suspension, user interaction unlock, and SSR environments safely.
 */

let audioCtx = null;

/**
 * Checks whether the Web Audio API is supported in the current environment.
 * @returns {boolean}
 */
export function isAudioSupported() {
  return typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);
}

/**
 * Lazily obtains or constructs the shared AudioContext instance safely in the browser.
 * @returns {AudioContext | null}
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }

  return audioCtx;
}

/**
 * Resumes audio context on user interaction (e.g. click "Start Timer") to satisfy browser autoplay policies.
 */
export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/**
 * Synthesizes a subtle, ascending two-tone start cue (G4 -> C5).
 * Audible confirmation that a new focus session has begun.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playStartCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.12;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    // Note 1: G4 (392.0 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(392.0, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(peakGain * 0.8, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Note 2: C5 (523.25 Hz) with 100ms offset for smooth legato rise
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.10);

    gain2.gain.setValueAtTime(0.0001, now + 0.10);
    gain2.gain.linearRampToValueAtTime(peakGain, now + 0.115);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.10);
    osc2.stop(now + 0.35);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes and plays a calm, restorative completion chime.
 * Polyphonic chord (C4, G4, 528 Hz, 660 Hz) with rich exponential decay.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const baseGain = 0.20;

    // Master gain with smooth exponential decay over 2.0 seconds
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(baseGain, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    // Root depth: C4 (261.63 Hz)
    const oscRoot = ctx.createOscillator();
    const gainRoot = ctx.createGain();
    oscRoot.type = 'sine';
    oscRoot.frequency.setValueAtTime(261.63, now);
    gainRoot.gain.setValueAtTime(0.35, now);
    gainRoot.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    // Harmonic fifth: G4 (392.0 Hz)
    const oscFifth = ctx.createOscillator();
    const gainFifth = ctx.createGain();
    oscFifth.type = 'sine';
    oscFifth.frequency.setValueAtTime(392.0, now + 0.02);
    gainFifth.gain.setValueAtTime(0.30, now + 0.02);
    gainFifth.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Primary restorative tone: 528 Hz (calming harmonic frequency)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);
    gain1.gain.setValueAtTime(0.70, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

    // Harmonic companion: 660 Hz (harmonic major third)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.04);
    gain2.gain.setValueAtTime(0.35, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Connect audio graph
    oscRoot.connect(gainRoot);
    oscFifth.connect(gainFifth);
    osc1.connect(gain1);
    osc2.connect(gain2);

    gainRoot.connect(masterGain);
    gainFifth.connect(masterGain);
    gain1.connect(masterGain);
    gain2.connect(masterGain);

    masterGain.connect(ctx.destination);

    // Start and auto-stop
    oscRoot.start(now);
    oscFifth.start(now + 0.02);
    osc1.start(now);
    osc2.start(now + 0.04);

    oscRoot.stop(now + 2.0);
    oscFifth.stop(now + 2.0);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);

    return true;
  } catch {
    // Gracefully handle browser restrictions, disabled audio, or unsupported environments
    return false;
  }
}
