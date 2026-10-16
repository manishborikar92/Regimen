import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTimingDisplay } from '../src/utils/date-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relPath) {
  return fs.readFileSync(path.join(webRoot, relPath), 'utf-8');
}

describe('Phase 6: Reading Timer & Routine Timing-Mode Controls', () => {
  describe('1. ReadingCard Component Architecture & Timer Invariants', () => {
    it('should verify ReadingCard.js exists and exports a memoized component', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(content.includes('export default memo(ReadingCard)'), 'Must export memo(ReadingCard)');
    });

    it('should verify ReadingCard derives duration from habit configuration without hardcoded constants', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(!content.includes('TARGET_SECONDS'), 'Must not define hardcoded TARGET_SECONDS constant');
      assert.ok(!content.includes('DURATION_PRESETS'), 'Must not define in-card DURATION_PRESETS');
      assert.ok(content.includes('getReadingTargetMinutes'), 'Must derive duration via getReadingTargetMinutes');
    });

    it('should verify timer cleanup and interval management', () => {
      const cardContent = readWebFile('src/components/habits/ReadingCard.js');
      const hookContent = readWebFile('src/hooks/use-timer.js');
      assert.ok(
        cardContent.includes('useTimer') && hookContent.includes('clearInterval(timerRef.current)'),
        'Must clear interval on unmount via timer subsystem'
      );
    });

    it('should verify auto-completion trigger when timer reaches 0', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(content.includes('onToggle(habit.id)'), 'Must auto-trigger onToggle when timer finishes');
    });

    it('should verify visual progress bar with width style percentage', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(content.includes('style={{ width: `${progressPercent}%` }}'), 'Must render dynamic progress bar');
    });

    it('should verify large monospace typography for digital timer readout', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(
        content.includes('font-mono') && content.includes('text-xl') && content.includes('text-main'),
        'Must use font-mono text-xl/2xl for time readout'
      );
    });

    it('should verify WCAG 2.2 compliant touch targets on all timer controls', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(content.includes('py-2') && content.includes('rounded-xl'), 'Timer start/pause button must define comfortable padding and target shape');
      assert.ok(content.includes('w-11 h-11') || content.includes('min-h-[44px]'), 'Timer reset button must meet 44x44px touch target');
    });

    it('should verify timer reset button disables when at initial idle state', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(
        content.includes('secondsRemaining === targetSeconds') ||
        content.includes('secondsRemaining === TARGET_SECONDS'),
        'Must disable reset button when already at target'
      );
    });

    it('should verify zero prohibited colors in ReadingCard', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      const prohibited = [
        'bg-indigo-', 'text-indigo-', 'border-indigo-',
        'bg-purple-', 'text-purple-', 'border-purple-',
        'bg-blue-600', 'text-blue-600',
      ];
      for (const token of prohibited) {
        assert.ok(!content.includes(token), `ReadingCard must not use prohibited token: ${token}`);
      }
    });
  });

  describe('2. HabitModal Timing-Mode Controls Architecture & Invariants', () => {
    it('should verify HabitModal.js exists and exports default function', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes('export default function HabitModal'), 'Must export HabitModal');
    });

    it('should verify all 4 canonical timing modes are declared in TIMING_TYPES', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes("id: 'anytime'"), "Must declare 'anytime' timing mode");
      assert.ok(content.includes("id: 'preferred_period'"), "Must declare 'preferred_period' timing mode");
      assert.ok(content.includes("id: 'relative'"), "Must declare 'relative' timing mode");
      assert.ok(content.includes("id: 'exact'"), "Must declare 'exact' timing mode");
    });

    it('should verify compact 2x2 responsive grid architecture for timing selection', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes('grid grid-cols-2 gap-1.5 sm:gap-2'), 'Must use 2-column grid for compact vertical height');
      assert.ok(content.includes('min-h-[46px]'), 'Timing buttons must meet touch target min-h-[46px]');
    });

    it('should verify quick preset suggestion chips for relative and exact timing', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes('Before bed'), 'Must provide Before bed preset chip');
      assert.ok(content.includes('After waking'), 'Must provide After waking preset chip');
      assert.ok(content.includes('07:00 AM'), 'Must provide morning preset chip');
      assert.ok(content.includes('09:00 PM'), 'Must provide evening preset chip');
    });

    it('should verify preferred period supports Morning, Afternoon, and Evening options', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes("'Morning'"), "Must include 'Morning'");
      assert.ok(content.includes("'Afternoon'"), "Must include 'Afternoon'");
      assert.ok(content.includes("'Evening'"), "Must include 'Evening'");
    });

    it('should verify non-punitive guidance text is rendered in modal', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(
        content.includes('Preferred times guide your day without penalty') ||
        content.includes('Soft guidance for your day'),
        'Must display supportive timing guidance note'
      );
    });

    it('should verify validation rules preserve routine integrity', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(content.includes('maxLength={120}'), 'Must enforce max title length');
      assert.ok(content.includes('formData.frequency.length === 0'), 'Must validate active frequency');
    });
  });

  describe('3. Timing Display & Scheduling Semantics Integration', () => {
    it('should format anytime routines as "Anytime"', () => {
      assert.equal(getTimingDisplay({ timingType: 'anytime' }), 'Anytime');
    });

    it('should format preferred period routines with "(Preferred)" suffix', () => {
      assert.equal(
        getTimingDisplay({ timingType: 'preferred_period', preferredPeriod: 'Morning' }),
        'Morning (Preferred)'
      );
      assert.equal(
        getTimingDisplay({ timingType: 'preferred_period', preferredPeriod: 'Afternoon' }),
        'Afternoon (Preferred)'
      );
      assert.equal(
        getTimingDisplay({ timingType: 'preferred_period', preferredPeriod: 'Evening' }),
        'Evening (Preferred)'
      );
    });

    it('should format relative routines with anchor text (e.g. "Before bed")', () => {
      assert.equal(
        getTimingDisplay({ timingType: 'relative', relativeTiming: 'Before bed' }),
        'Before bed'
      );
      assert.equal(
        getTimingDisplay({ timingType: 'relative', relativeTiming: 'After waking' }),
        'After waking'
      );
    });

    it('should format exact timing routines with clock time', () => {
      assert.equal(
        getTimingDisplay({ timingType: 'exact', time: '04:30 PM' }),
        '04:30 PM'
      );
    });

    it('should fallback gracefully to "Anytime" for empty or missing habit objects', () => {
      assert.equal(getTimingDisplay(null), 'Anytime');
      assert.equal(getTimingDisplay({}), 'Anytime');
    });
  });
});
