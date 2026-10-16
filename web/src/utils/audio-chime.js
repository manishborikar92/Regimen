/**
 * Audio Chime Utility — Zero-dependency Web Audio API sound synthesizer.
 *
 * Provides calibrated synthesized auditory cues for specialized routines:
 * - playStartCue: Rising two-note interval (G4 -> C5) for focus initiation (0.35s)
 * - playPauseCue: Soft descending inflection (E4 -> C4) for gentle pause acknowledgement (0.12s)
 * - playResumeCue: Gentle ascending inflection (C4 -> E4) for re-entry into focus (0.12s)
 * - playResetCue: Restrained acoustic double-tap (580Hz -> 440Hz) for timer reset (0.08s)
 * - playCompletionChime: Resonant harmonic chord (C4, G4, 528Hz, 660Hz) with 2.0s decay
 * - playStepToggleCue: Crisp micro-chirplet (784Hz -> 1046.5Hz) on check (35ms); soft muted tick (523.25Hz -> 392Hz) on uncheck (40ms)
 * - playHabitCompleteCue: Celebratory consonant chord (E5, B5 -> C6) with 0.65s decay
 * - playTabSwitchCue: Featherlight damped sine tap (523.25Hz) for in-page view changes (25ms)
 * - playActionSuccessCue: Warm ascending major third (C5 -> E5) for routine creation/save (0.20s)
 * - playActionDeleteCue: Low soft descending release (G3 -> E3) for routine removal (0.18s)
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
 * Resumes audio context on user interaction to satisfy browser autoplay policies.
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
 * Synthesizes a soft, brief descending inflection (E4 -> C4) for pausing an active timer.
 * Provides calm, non-punitive confirmation that focus has been paused.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playPauseCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.08;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    // Descend from E4 (329.63 Hz) to C4 (261.63 Hz)
    osc.frequency.setValueAtTime(329.63, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.12);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a gentle, brief ascending inflection (C4 -> E4) for resuming a paused timer.
 * Distinct from fresh start; signals encouraging re-entry into the focus flow.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playResumeCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.08;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    // Ascend from C4 (261.63 Hz) to E4 (329.63 Hz)
    osc.frequency.setValueAtTime(261.63, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.12);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a restrained, clean acoustic tap (580 Hz -> 440 Hz) when a timer is genuinely reset.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playResetCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.06;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(580.0, now);
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.08);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes and plays a calm, restorative completion chime.
 * Polyphonic chord (C4, G4, 528 Hz, 660 Hz) with rich exponential decay over 2.0s.
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

    // Harmonic tone: 528 Hz
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
    return false;
  }
}

/**
 * Synthesizes a subtle, tactile tick when checking or unchecking a checklist step.
 * - isChecked = true: Crisp upward chirplet (G5 784 Hz -> C6 1046.5 Hz, 35ms)
 * - isChecked = false: Softer, neutral downward tick (C5 523.25 Hz -> G4 392 Hz, 40ms)
 *
 * @param {boolean} [isChecked=true] Whether the step is transitioning to checked or unchecked.
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playStepToggleCue(isChecked = true) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    if (isChecked) {
      // Crisp upward tick (35ms)
      const peakGain = 0.09;
      osc.frequency.setValueAtTime(784.0, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.035);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.035);
    } else {
      // Softer, neutral downward tick (40ms)
      const peakGain = 0.06;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(392.0, now + 0.040);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.040);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a short celebratory harmonic cue for completing an entire habit or routine.
 * Consonant chord: E5 (659.25 Hz) + B5 (987.77 Hz) -> C6 (1046.5 Hz) over 0.65s.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playHabitCompleteCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const baseGain = 0.14;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(baseGain, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    masterGain.connect(ctx.destination);

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.6, now + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.60);

    // Tone 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.01);
    gain2.gain.setValueAtTime(0.0001, now + 0.01);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.022);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.60);

    // Tone 3: C6 (1046.5 Hz) resolving note
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1046.5, now + 0.04);
    gain3.gain.setValueAtTime(0.0001, now + 0.04);
    gain3.gain.linearRampToValueAtTime(0.5, now + 0.055);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc3.connect(gain3);
    gain3.connect(masterGain);

    osc1.start(now);
    osc2.start(now + 0.01);
    osc3.start(now + 0.04);

    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);
    osc3.stop(now + 0.65);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a subtle, featherlight tap (C5 523.25 Hz, 25ms) when an in-page view tab is switched.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playTabSwitchCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.05;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(523.25, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.025);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a warm ascending major third (C5 -> E5, 0.20s) for routine creation or saving.
 * Plays only after the save operation has successfully completed.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playActionSuccessCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.10;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.20);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.010);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.20);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.20);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a low, soft descending release (G3 -> E3, 0.18s) when a routine is deleted.
 * Plays only after the delete operation has successfully completed.
 *
 * @returns {boolean} True if audio synthesis was successfully triggered, false otherwise.
 */
export function playActionDeleteCue() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const peakGain = 0.07;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(196.0, now);
    osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.18);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.18);

    return true;
  } catch {
    return false;
  }
}

