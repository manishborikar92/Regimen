import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isAudioSupported,
  getAudioContext,
  unlockAudio,
  playStartCue,
  playCompletionChime,
} from '../src/utils/audio-chime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relPath) {
  return fs.readFileSync(path.join(webRoot, relPath), 'utf-8');
}

describe('Phase 7: Interactive Sound Experience & Timer Audio Polish (Two-Sound Engine)', () => {
  describe('1. Web Audio API Synthesizer Architecture & Calibration', () => {
    it('should export all required synthesizer methods and helpers from audio-chime.js', () => {
      const content = readWebFile('src/utils/audio-chime.js');
      assert.ok(content.includes('export function isAudioSupported()'), 'Must export isAudioSupported');
      assert.ok(content.includes('export function getAudioContext()'), 'Must export getAudioContext');
      assert.ok(content.includes('export function unlockAudio()'), 'Must export unlockAudio');
      assert.ok(content.includes('export function playStartCue()'), 'Must export playStartCue');
      assert.ok(content.includes('export function playCompletionChime()'), 'Must export playCompletionChime()');
      assert.ok(!content.includes('playMilestoneCue'), 'Must NOT export deleted playMilestoneCue');
    });

    it('should verify Timer Start cue uses rising two-tone musical interval (G4 -> C5)', () => {
      const content = readWebFile('src/utils/audio-chime.js');
      assert.ok(content.includes('392.0'), 'playStartCue must use G4 (392.0 Hz)');
      assert.ok(content.includes('523.25'), 'playStartCue must use C5 (523.25 Hz)');
      assert.ok(content.includes('0.35'), 'playStartCue duration must be approximately 0.35s');
    });

    it('should verify Timer Completion cue uses polyphonic resonant chord with deep decay', () => {
      const content = readWebFile('src/utils/audio-chime.js');
      assert.ok(content.includes('261.63'), 'playCompletionChime must include C4 root (261.63 Hz)');
      assert.ok(content.includes('528'), 'playCompletionChime must preserve Solfeggio 528 Hz harmonic');
      assert.ok(content.includes('660'), 'playCompletionChime must preserve major third 660 Hz');
      assert.ok(content.includes('2.0'), 'playCompletionChime duration must be approximately 2.0s');
    });

    it('should execute SSR safety checks without crashing when window is undefined', () => {
      assert.equal(isAudioSupported(), false, 'isAudioSupported must return false in Node SSR');
      assert.equal(getAudioContext(), null, 'getAudioContext must return null in Node SSR');
      assert.doesNotThrow(() => unlockAudio(), 'unlockAudio must not throw in SSR');
      assert.equal(playStartCue(), false, 'playStartCue must return false in SSR without throwing');
      assert.equal(playCompletionChime(), false, 'playCompletionChime must return false in SSR without throwing');
    });
  });

  describe('2. Sound Preference Persistence & Direct Toggle Architecture', () => {
    it('should verify default preference logic for sound-enabled state', () => {
      const SOUND_ENABLED_KEY = 'vritta-sound-enabled';
      const DEFAULT_ENABLED = true;

      function mockGetStoredSoundEnabled(mockStorage) {
        if (!mockStorage) return DEFAULT_ENABLED;
        const stored = mockStorage[SOUND_ENABLED_KEY];
        if (stored === undefined || stored === null) return DEFAULT_ENABLED;
        return stored === 'true';
      }

      assert.equal(mockGetStoredSoundEnabled({}), true, 'Default sound enabled must be true');
      assert.equal(mockGetStoredSoundEnabled({ [SOUND_ENABLED_KEY]: 'false' }), false, 'Honors stored false');
      assert.equal(mockGetStoredSoundEnabled({ [SOUND_ENABLED_KEY]: 'true' }), true, 'Honors stored true');
    });

    it('should verify SoundContext provides toggleSound and does not retain volume or preview logic', () => {
      const content = readWebFile('src/contexts/SoundContext.js');
      assert.ok(content.includes('export function SoundProvider('), 'Must export SoundProvider');
      assert.ok(content.includes('export function useSound()'), 'Must export useSound');
      assert.ok(content.includes('vritta-sound-enabled'), 'Must persist to vritta-sound-enabled key');
      assert.ok(content.includes('toggleSound'), 'Must provide toggleSound action');
      assert.ok(!content.includes('vritta-sound-volume'), 'Must NOT retain vritta-sound-volume key');
      assert.ok(!content.includes('previewCue'), 'Must NOT retain previewCue action');
      assert.ok(!content.includes('playMilestoneCue'), 'Must NOT retain playMilestoneCue action');
    });

    it('should verify SoundProvider is mounted above TimerProvider in layout.js hierarchy', () => {
      const layoutContent = readWebFile('src/app/layout.js');
      assert.ok(layoutContent.includes('<SoundProvider>'), 'RootLayout must mount SoundProvider');
      assert.ok(layoutContent.includes('<TimerProvider>'), 'RootLayout must mount TimerProvider');

      const soundIndex = layoutContent.indexOf('<SoundProvider>');
      const timerIndex = layoutContent.indexOf('<TimerProvider>');
      assert.ok(
        soundIndex < timerIndex,
        'SoundProvider MUST be mounted above TimerProvider so TimerContext can consume SoundContext'
      );
    });

    it('should verify contexts/index.js exports SoundProvider and useSound', () => {
      const indexContent = readWebFile('src/contexts/index.js');
      assert.ok(indexContent.includes('SoundProvider'), 'contexts/index.js must export SoundProvider');
      assert.ok(indexContent.includes('useSound'), 'contexts/index.js must export useSound');
    });
  });

  describe('3. Timer Lifecycle & Sound Event Invariants (Two-Sound Engine)', () => {
    it('should verify fresh timer start triggers start cue exactly once, while resume remains silent', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');
      assert.ok(
        contextContent.includes('if (!isResuming && playStartCue)'),
        'startTimer must guard playStartCue with !isResuming so only fresh sessions produce sound'
      );
      assert.ok(
        contextContent.includes('playStartCue()'),
        'startTimer must call playStartCue on fresh start'
      );
    });

    it('should verify pause, resume, and reset actions are strictly silent', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');

      // Pause section must not call any sound cues
      const pauseSection = contextContent.slice(
        contextContent.indexOf('const pauseTimer ='),
        contextContent.indexOf('const resetTimer =')
      );
      assert.ok(!pauseSection.includes('playStartCue'), 'pauseTimer must not play start cue');
      assert.ok(!pauseSection.includes('playCompletionCue'), 'pauseTimer must not play completion cue');

      // Reset section must not call any sound cues
      const resetSection = contextContent.slice(
        contextContent.indexOf('const resetTimer ='),
        contextContent.indexOf('const setTimerDuration =')
      );
      assert.ok(!resetSection.includes('playStartCue'), 'resetTimer must not play start cue');
      assert.ok(!resetSection.includes('playCompletionCue'), 'resetTimer must not play completion cue');
    });

    it('should verify timer completion triggers completion cue exactly once via handleTimerFinished', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');
      assert.ok(
        contextContent.includes('if (!isSilent && playCompletionCue)'),
        'handleTimerFinished must guard playCompletionCue with !isSilent'
      );
      assert.ok(
        contextContent.includes('playCompletionCue()'),
        'handleTimerFinished must call playCompletionCue when !isSilent'
      );
      assert.ok(
        contextContent.includes('finishingTimersRef.current.has(id)'),
        'tickTimers must use finishingTimersRef to prevent duplicate completion handling'
      );
    });

    it('should verify reload recovery for expired timer is strictly silent', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');
      assert.ok(
        contextContent.includes('handleTimerFinished(id, t.targetMinutes, true /* isSilent'),
        'Reload recovery for expiredWhileAway must pass isSilent=true to handleTimerFinished'
      );
    });

    it('should verify audio failure does not interrupt timer progress logging or notifications', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');
      const finishFn = contextContent.slice(
        contextContent.indexOf('const handleTimerFinished ='),
        contextContent.indexOf('// Handle reload recovery')
      );
      assert.ok(
        finishFn.includes('updateProgress(habitId, { durationMinutes: targetMinutes }, true)'),
        'handleTimerFinished must call updateProgress even if playCompletionCue fails'
      );
      assert.ok(
        finishFn.includes('sendTimerNotification('),
        'handleTimerFinished must dispatch notifications even if audio fails'
      );
    });

    it('should verify standalone use-timer.js fallback supports start cue and completion chime without milestone logic', () => {
      const hookContent = readWebFile('src/hooks/use-timer.js');
      assert.ok(hookContent.includes('playStartCue()'), 'use-timer.js must call playStartCue');
      assert.ok(hookContent.includes('playCompletionChime()'), 'use-timer.js must call playCompletionChime');
      assert.ok(!hookContent.includes('playMilestoneCue'), 'use-timer.js must NOT reference playMilestoneCue');
      assert.ok(!hookContent.includes('halfwayPassed'), 'use-timer.js must NOT reference halfwayPassed');
    });

    it('should verify halfway/milestone code is completely removed from TimerContext.js', () => {
      const contextContent = readWebFile('src/contexts/TimerContext.js');
      assert.ok(!contextContent.includes('playMilestoneCue'), 'TimerContext must not reference playMilestoneCue');
      assert.ok(!contextContent.includes('halfwayPassed'), 'TimerContext must not reference halfwayPassed');
      assert.ok(!contextContent.includes('reachedMilestonesRef'), 'TimerContext must not reference reachedMilestonesRef');
      assert.ok(!contextContent.includes('_50'), 'TimerContext must not reference 50% milestone keys');
    });
  });

  describe('4. Direct Sound Toggle UI & WCAG 2.2 Accessibility Invariants', () => {
    it('should verify SoundControl component exists and exports direct toggle button without popovers', () => {
      const controlContent = readWebFile('src/components/ui/SoundControl.js');
      assert.ok(controlContent.includes('export default function SoundControl('), 'SoundControl must export default function');
      assert.ok(!controlContent.includes('role="dialog"'), 'SoundControl must NOT render dialog popover');
      assert.ok(!controlContent.includes('type="range"'), 'SoundControl must NOT render volume slider');
      assert.ok(!controlContent.includes('previewCue'), 'SoundControl must NOT render preview buttons');
    });

    it('should verify SoundControl complies with WCAG 2.2 touch target and ARIA semantics', () => {
      const controlContent = readWebFile('src/components/ui/SoundControl.js');
      assert.ok(controlContent.includes('w-10 h-10'), 'Button must provide accessible 40x40px touch area');
      assert.ok(controlContent.includes('onClick={toggleSound}'), 'Button must toggle sound on single click');
      assert.ok(controlContent.includes('aria-label='), 'Button must define descriptive aria-label');
      assert.ok(controlContent.includes('Volume2') && controlContent.includes('VolumeX'), 'Button must toggle between Volume2 and VolumeX');
    });

    it('should verify TopNav renders SoundControl adjacent to ThemeToggle in persistent header', () => {
      const topNavContent = readWebFile('src/components/ui/TopNav.js');
      assert.ok(topNavContent.includes('import SoundControl'), 'TopNav must import SoundControl');
      assert.ok(topNavContent.includes('<SoundControl />'), 'TopNav must render SoundControl');
      assert.ok(topNavContent.includes('<ThemeToggle />'), 'TopNav must render ThemeToggle');

      const soundPos = topNavContent.indexOf('<SoundControl />');
      const themePos = topNavContent.indexOf('<ThemeToggle />');
      assert.ok(soundPos < themePos, 'SoundControl must be positioned next to ThemeToggle in header');
    });
  });
});
