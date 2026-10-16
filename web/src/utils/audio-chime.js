/**
 * Audio Chime Utility — Zero-dependency Web Audio API sound synthesizer.
 *
 * Produces a gentle, dual-harmonic restorative chime (528 Hz Solfeggio frequency + 660 Hz major third)
 * with smooth exponential volume decay, designed for calm completion feedback without jarring alerts.
 * Handles audio context suspension, user interaction unlock, and SSR / headless environments safely.
 */

let audioCtx = null;

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
 * Synthesizes and plays a calm, restorative completion chime.
 * Gracefully catches and suppresses errors when audio APIs are restricted, muted, or unavailable.
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

    // Primary restorative tone: 528 Hz (calming harmonic frequency)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, now);

    // Harmonic companion: 660 Hz (harmonic major third)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.04);

    // Master gain with smooth exponential decay over 1.8 seconds
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    // Node envelopes
    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    gain2.gain.setValueAtTime(0.35, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    // Connect audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Start and auto-stop
    osc1.start(now);
    osc2.start(now + 0.04);
    osc1.stop(now + 1.8);
    osc2.stop(now + 1.8);

    return true;
  } catch {
    // Gracefully handle browser restrictions, disabled audio, or unsupported environments
    return false;
  }
}
