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
    it('should verify primary circular completion buttons meet min 44x44px touch targets', () => {
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
        const has44pxButton = content.includes('w-11 h-11') ||
          (content.includes('w-11') && content.includes('h-11')) ||
          (content.includes('min-w-[44px]') && content.includes('min-h-[44px]'));
        assert.ok(
          has44pxButton,
          `${cardPath} must declare 44x44px (w-11 h-11) on primary toggle button`
        );
      }
    });

    it('should verify WorkbookCard stepper controls meet min 44x44px touch targets', () => {
      const content = readWebFile('src/components/habits/WorkbookCard.js');
      const has44pxStepper = content.includes('w-11 h-11') ||
        (content.includes('w-11') && content.includes('h-11')) ||
        (content.includes('min-w-[44px]') && content.includes('min-h-[44px]'));
      assert.ok(has44pxStepper, 'WorkbookCard must have 44x44px stepper buttons');
    });

    it('should verify ReadingCard timer controls provide accessible interactive targets', () => {
      const content = readWebFile('src/components/habits/ReadingCard.js');
      const hasAccessibleStart = content.includes('py-2') && content.includes('rounded-xl');
      const has44pxReset = content.includes('w-11 h-11') || content.includes('min-w-[44px]');
      assert.ok(hasAccessibleStart, 'ReadingCard start timer must define comfortable padding and target sizing');
      assert.ok(has44pxReset, 'ReadingCard timer reset must meet 44x44px (w-11 h-11)');
    });

    it('should verify OshoCard Change Series button meets touch target guidelines', () => {
      const content = readWebFile('src/components/habits/OshoCard.js');
      assert.ok(
        content.includes('py-2') && content.includes('Change Series') && content.includes('rounded-lg'),
        'OshoCard Change Series button must define accessible padding and rounded corners'
      );
    });

    it('should verify DiaryCard and SpeakingCard secondary toggles provide accessible interactive triggers', () => {
      const diaryContent = readWebFile('src/components/habits/DiaryCard.js');
      assert.ok(diaryContent.includes('py-2') && diaryContent.includes('w-full'), 'DiaryCard editor toggle must define accessible vertical padding');

      const speakingContent = readWebFile('src/components/habits/SpeakingCard.js');
      assert.ok(speakingContent.includes('py-2'), 'SpeakingCard notes toggle must define accessible vertical padding');
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

    it('should verify MovementCard expanded steps use flex-col on mobile to prevent title crushing', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(
        content.includes('flex flex-col sm:flex-row sm:items-center sm:justify-between'),
        'Movement steps must use responsive column-to-row wrapping'
      );
      assert.ok(
        content.includes('self-start sm:self-auto'),
        'Movement step duration badges must align cleanly on mobile'
      );
    });

    it('should verify Safety & Progression Modal follows standardized Vritta modal architecture', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(
        content.includes('rounded-t-3xl sm:rounded-2xl'),
        'Modal container must use bottom-sheet on mobile and centered modal on desktop'
      );
      assert.ok(
        content.includes('items-end sm:items-center'),
        'Backdrop must align bottom on mobile and center on desktop'
      );
      assert.ok(
        content.includes('flex-shrink-0 z-10'),
        'Modal header must remain pinned at the top during scrolling'
      );
      assert.ok(
        content.includes('<X className="w-5 h-5" />'),
        'Modal must use standard Lucide X close control'
      );
      assert.ok(
        content.includes('e.target === e.currentTarget'),
        'Modal must allow closing by clicking on the backdrop overlay'
      );
    });
  });
});

