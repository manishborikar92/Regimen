import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relativePath) {
  const fullPath = path.join(webRoot, relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

describe('Phase 2: Mobile-First Dashboard Cards Redesign', () => {
  const cards = [
    'src/components/habits/WorkbookCard.js',
    'src/components/habits/MovementCard.js',
    'src/components/habits/OshoCard.js',
    'src/components/habits/ReadingCard.js',
    'src/components/habits/SpeakingCard.js',
    'src/components/habits/DiaryCard.js',
    'src/components/habits/GenericHabitCard.js',
  ];

  describe('1. Component Existence & Memoization Invariants', () => {
    it('should verify all 7 habit cards exist and export memoized components', () => {
      for (const cardPath of cards) {
        const content = readWebFile(cardPath);
        assert.ok(content.length > 0, `${cardPath} must exist and have content`);
        assert.ok(
          content.includes('export default memo('),
          `${cardPath} must export a memoized component to prevent re-render cascades`
        );
      }
    });
  });

  describe('2. WCAG 2.2 Touch Target Compliance (min 44x44px for Interactive Controls)', () => {
    it('should verify primary circular completion buttons meet min-w-[44px] min-h-[44px]', () => {
      const toggleCards = [
        'src/components/habits/MovementCard.js',
        'src/components/habits/OshoCard.js',
        'src/components/habits/ReadingCard.js',
        'src/components/habits/SpeakingCard.js',
        'src/components/habits/DiaryCard.js',
        'src/components/habits/GenericHabitCard.js',
      ];

      for (const cardPath of toggleCards) {
        const content = readWebFile(cardPath);
        assert.ok(
          content.includes('min-w-[44px]') && content.includes('min-h-[44px]'),
          `${cardPath} must declare min-w-[44px] min-h-[44px] on primary toggle button`
        );
      }
    });

    it('should verify WorkbookCard stepper controls meet min-w-[44px] min-h-[44px]', () => {
      const content = readWebFile('src/components/habits/WorkbookCard.js');
      assert.ok(content.includes('min-w-[44px]'), 'WorkbookCard must have min-w-[44px] stepper buttons');
      assert.ok(content.includes('min-h-[44px]'), 'WorkbookCard must have min-h-[44px] stepper buttons');
    });

    it('should verify ReadingCard timer controls meet min-h-[44px]', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      assert.ok(content.includes('min-h-[44px]'), 'ReadingCard timer controls must meet min-h-[44px]');
      assert.ok(content.includes('min-w-[44px]'), 'ReadingCard timer reset must meet min-w-[44px]');
    });

    it('should verify OshoCard Change Series button meets min-h-[44px]', () => {
      const content = readWebFile('src/components/habits/OshoCard.js');
      assert.ok(
        content.includes('min-h-[44px]') && content.includes('Change Series'),
        'OshoCard Change Series button must meet min-h-[44px]'
      );
    });

    it('should verify DiaryCard and SpeakingCard secondary toggles meet min-h-[44px]', () => {
      const diaryContent = readWebFile('src/components/habits/DiaryCard.js');
      assert.ok(diaryContent.includes('min-h-[44px]'), 'DiaryCard editor toggle and save must meet min-h-[44px]');

      const speakingContent = readWebFile('src/components/habits/SpeakingCard.js');
      assert.ok(speakingContent.includes('min-h-[44px]'), 'SpeakingCard notes toggle must meet min-h-[44px]');
    });
  });

  describe('3. Mobile Usability & Typography Safeguards', () => {
    it('should verify textareas use text-base sm:text-xs to prevent iOS mobile auto-zoom', () => {
      const speakingContent = readWebFile('src/components/habits/SpeakingCard.js');
      assert.ok(
        speakingContent.includes('text-base sm:text-xs'),
        'SpeakingCard textarea must prevent mobile auto-zoom'
      );

      const diaryContent = readWebFile('src/components/habits/DiaryCard.js');
      assert.ok(
        diaryContent.includes('text-base sm:text-xs'),
        'DiaryCard textarea must prevent mobile auto-zoom'
      );
    });

    it('should verify category top-border accents are preserved across all cards', () => {
      for (const cardPath of cards) {
        const content = readWebFile(cardPath);
        assert.ok(
          content.includes('border-t-[3px]'),
          `${cardPath} must implement border-t-[3px] integrated category accent`
        );
      }
    });

    it('should verify OshoCard active series banner prevents title truncation', () => {
      const content = readWebFile('src/components/habits/OshoCard.js');
      assert.ok(
        content.includes('{activeSeries.order}. {activeSeries.title}'),
        'OshoCard must render active series title cleanly'
      );
      assert.ok(
        !content.includes('<p className="text-xs sm:text-sm font-bold text-main truncate">'),
        'OshoCard active series title must not be artificially clamped with truncate'
      );
    });

    it('should verify MovementCard steps header integrates chevron inside the toggle button', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(
        content.includes('View all ${currentItems.length} steps'),
        'MovementCard must render clear step count in toggle'
      );
      assert.ok(
        content.includes('ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200'),
        'MovementCard must include smooth chevron transition'
      );
    });
  });
});
