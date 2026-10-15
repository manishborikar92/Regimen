import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relativePath) {
  const filePath = path.join(webRoot, relativePath);
  return fs.readFileSync(filePath, 'utf8');
}

function getAllJsFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllJsFiles(fullPath));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Phase 3: UI/UX Component Polish (Mobile-First)', () => {

  describe('1. Legacy Color & Heather Purple Elimination', () => {
    const targetDirs = [
      path.join(webRoot, 'src', 'app', '(protected)'),
      path.join(webRoot, 'src', 'components', 'habits'),
      path.join(webRoot, 'src', 'components', 'ui'),
    ];

    it('should verify zero occurrences of "purple" across all protected routes and components', () => {
      const files = targetDirs.flatMap(getAllJsFiles);
      const violations = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (/purple/i.test(content)) {
          violations.push(path.relative(webRoot, file));
        }
      }

      assert.deepEqual(violations, [], `Prohibited color "purple" found in files: ${violations.join(', ')}`);
    });

    it('should verify zero occurrences of "indigo" across all protected routes and components', () => {
      const files = targetDirs.flatMap(getAllJsFiles);
      const violations = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (/indigo/i.test(content)) {
          violations.push(path.relative(webRoot, file));
        }
      }

      assert.deepEqual(violations, [], `Legacy color "indigo" found in files: ${violations.join(', ')}`);
    });

    it('should verify categories.js completely eliminates purple and indigo and defines dark mode tokens', () => {
      const categoriesContent = readWebFile('src/lib/constants/categories.js');
      assert.ok(!/purple/i.test(categoriesContent), 'categories.js must not contain purple');
      assert.ok(!/indigo/i.test(categoriesContent), 'categories.js must not contain indigo');

      // Verify Recovery category uses teal tokens
      assert.ok(categoriesContent.includes("border-l-teal-600"), 'Recovery category must use teal border accent');
      assert.ok(categoriesContent.includes("bg-teal-50"), 'Recovery category must use teal background');

      // Verify dark mode classes exist in badgeClasses
      assert.ok(categoriesContent.includes("dark:bg-slate-800"), 'Category badges must declare dark background tokens');
      assert.ok(categoriesContent.includes("dark:text-slate-300"), 'Category badges must declare dark text tokens');
    });
  });

  describe('2. WCAG 2.2 Target Size (min 44x44px for primary mobile actions)', () => {
    it('should verify all core toggle habit cards define min-w-[44px] min-h-[44px] toggle buttons', () => {
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
        const has44pxCheckmark = content.includes('min-w-[44px]') && content.includes('min-h-[44px]');
        assert.ok(
          has44pxCheckmark,
          `${cardPath} must specify min-w-[44px] min-h-[44px] on primary toggle button`
        );
      }
    });

    it('should verify WorkbookCard stepper buttons are at least 40x40px', () => {
      const content = readWebFile('src/components/habits/WorkbookCard.js');
      assert.ok(content.includes('min-w-[40px]'), 'WorkbookCard stepper must specify min-w-[40px]');
      assert.ok(content.includes('min-h-[40px]'), 'WorkbookCard stepper must specify min-h-[40px]');
    });

    it('should verify BottomNav items meet touch target accessibility guidelines', () => {
      const content = readWebFile('src/components/ui/BottomNav.js');
      assert.ok(content.includes('min-h-[44px]'), 'BottomNav links must meet min-h-[44px]');
      assert.ok(content.includes('min-w-[56px]'), 'BottomNav links must meet min-w-[56px]');
    });

    it('should verify Routine Manager actions meet minimum touch targets', () => {
      const content = readWebFile('src/app/(protected)/habits/page.js');
      assert.ok(content.includes('min-w-[44px]') && content.includes('min-h-[44px]'), 'Habit action buttons must meet min-w-[44px] min-h-[44px]');
    });
  });

  describe('3. Brand Color Application & Dark Mode Integration', () => {
    it('should verify StreakCounter integrates Warm Amber #D97706 and teal completed badge', () => {
      const content = readWebFile('src/components/habits/StreakCounter.js');
      assert.ok(content.includes('text-amber-600') && content.includes('dark:text-amber-400'), 'StreakCounter must use Warm Amber text');
      assert.ok(content.includes('text-teal-700') && content.includes('dark:text-teal-300'), 'StreakCounter must use teal completed badge');
      assert.ok(content.includes('dark:via-[#111827]') || content.includes('dark:bg-slate-800'), 'StreakCounter must support dark background');
    });

    it('should verify BottomNav applies Luminous Teal active state and Deep Obsidian backdrop', () => {
      const content = readWebFile('src/components/ui/BottomNav.js');
      assert.ok(content.includes('text-teal-700') && content.includes('dark:text-teal-300'), 'BottomNav active text must be teal');
      assert.ok(content.includes('bg-teal-50') && content.includes('dark:bg-teal-950/60'), 'BottomNav active background must be teal');
      assert.ok(content.includes('bg-surface') || content.includes('dark:bg-[#090D16]/95'), 'BottomNav bar must use Deep Obsidian or semantic surface backdrop in dark mode');
    });

    it('should verify LoadingSpinner uses teal breathing halo and dark mode support', () => {
      const content = readWebFile('src/components/ui/LoadingSpinner.js');
      assert.ok(content.includes('border-teal-400/20') || content.includes('border-teal-400/30'), 'LoadingSpinner halo must be teal');
      assert.ok(content.includes('border-t-teal-500/70') || content.includes('border-t-teal-400/80'), 'LoadingSpinner spinner ring must be teal');
      assert.ok(content.includes('bg-canvas') || content.includes('dark:bg-[#090D16]/90'), 'LoadingSpinner canvas backdrop must use Deep Obsidian or semantic canvas');
      assert.ok(content.includes('bg-surface') || content.includes('dark:bg-slate-900'), 'LoadingSpinner logo card must support dark background');
    });

    it('should verify ConfirmDialog supports dark mode and teal styling for non-danger dialogs', () => {
      const content = readWebFile('src/components/ui/ConfirmDialog.js');
      assert.ok(content.includes('bg-surface') || content.includes('dark:bg-slate-900'), 'ConfirmDialog card must support dark mode');
      assert.ok(content.includes('bg-teal-100') && content.includes('bg-teal-600'), 'ConfirmDialog non-danger must use teal');
      assert.ok(content.includes('min-h-[44px]'), 'ConfirmDialog buttons must satisfy 44px touch target');
    });

    it('should verify protected layout container applies Deep Obsidian in dark mode', () => {
      const content = readWebFile('src/app/(protected)/layout.js');
      assert.ok(content.includes('bg-canvas') || content.includes('dark:bg-[#090D16]'), 'Protected layout container must use Deep Obsidian or semantic canvas in dark mode');
    });

    it('should verify all major views implement comprehensive dark mode surfaces and borders', () => {
      const views = [
        'src/app/(protected)/dashboard/page.js',
        'src/app/(protected)/habits/page.js',
        'src/app/(protected)/analytics/page.js',
      ];

      for (const view of views) {
        const content = readWebFile(view);
        assert.ok(content.includes('dark:bg-'), `${view} must include dark background classes`);
        assert.ok(content.includes('dark:border-'), `${view} must include dark border classes`);
        assert.ok(content.includes('dark:text-'), `${view} must include dark text classes`);
      }
    });
  });
});
