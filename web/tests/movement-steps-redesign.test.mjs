import { describe, it } from 'node:test';
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

describe('Phase 4: State Movement Steps UI Redesign', () => {
  const movementCardPath = 'src/components/habits/MovementCard.js';

  describe('1. Component Architecture & Memoization Invariant', () => {
    it('should verify MovementCard exists and exports a memoized component', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(content.length > 0, 'MovementCard.js must exist and not be empty');
      assert.ok(
        content.includes('export default memo(MovementCard)'),
        'MovementCard must export a memoized component'
      );
    });
  });

  describe('2. Step Card Structure & Checkbox Alignment', () => {
    it('should verify each exercise step is rendered as a structured rounded-2xl card', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('rounded-2xl border transition-all'),
        'Exercise step must be styled as a rounded-2xl card'
      );
    });

    it('should verify checkbox is aligned alongside the numbered exercise title with accessible label', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('type="checkbox"'),
        'Step card must include a checkbox input'
      );
      assert.ok(
        content.includes('aria-label={`Mark step ${idx + 1} (${item.name}) complete`}'),
        'Checkbox must provide an accessible aria-label identifying the step index and name'
      );
      assert.ok(
        content.includes('{idx + 1}. {item.name}'),
        'Step title must render numbered exercise name'
      );
    });
  });

  describe('3. Target & Duration Badge Responsive Placement', () => {
    it('should verify target/duration badge renders Clock icon and compact pill styling', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('<Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />'),
        'Duration badge must render Clock icon'
      );
      assert.ok(
        content.includes('rounded-full font-medium border border-teal-200 dark:border-teal-800/60'),
        'Duration badge must use compact rounded-full pill styling'
      );
    });

    it('should place duration badge beneath title on mobile and horizontally on wider viewports', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('flex flex-col sm:flex-row sm:items-center sm:justify-between'),
        'Title and badge container must be flex-col on mobile and sm:flex-row on wider viewports'
      );
      assert.ok(
        content.includes('self-start sm:self-auto'),
        'Duration badge must align self-start on mobile and self-auto on wider viewports'
      );
    });
  });

  describe('4. Subtle Divider & Full-Width Disclosure Row', () => {
    it('should separate exercise content from disclosure using a subtle divider', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('border-t border-stone-200/70 dark:border-stone-700/60 my-2.5 sm:my-3'),
        'Step card must include a subtle divider above the disclosure trigger'
      );
    });

    it('should provide full-width comfortably tappable disclosure trigger with aligned chevron', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(
        content.includes('Form instructions & variations'),
        'Disclosure button must display "Form instructions & variations"'
      );
      assert.ok(
        content.includes('w-full flex items-center justify-between text-left min-h-[38px]'),
        'Disclosure button must be a full-width row with justify-between and min-h-[38px]'
      );
      assert.ok(
        content.includes('aria-expanded={isItemDetailsOpen}'),
        'Disclosure button must declare aria-expanded state'
      );
      assert.ok(
        content.includes('rotate-180'),
        'ChevronDown must rotate 180 degrees when expanded'
      );
    });
  });

  describe('5. Preservation of Business Logic & Safety Modals', () => {
    it('should preserve Sunday rest day exclusion logic', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(content.includes('isSunday'), 'Must preserve Sunday rest day logic');
      assert.ok(content.includes('Sunday Planned Rest & Recovery'), 'Must render Sunday rest banner');
    });

    it('should preserve 12-week plan activation and safety modal handlers', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(content.includes('handleActivatePlan'), 'Must preserve handleActivatePlan');
      assert.ok(content.includes('setShowSafetyModal(true)'), 'Must preserve Safety Modal trigger');
      assert.ok(content.includes('12-Week Plan, Safety & Stop Signals'), 'Must preserve Safety modal link');
    });
  });

  describe('6. Design System & Prohibited Color Audit', () => {
    it('should verify zero occurrences of "purple" or "indigo" in MovementCard', () => {
      const content = readWebFile(movementCardPath);
      assert.ok(!/purple/i.test(content), 'Prohibited color "purple" found in MovementCard.js');
      assert.ok(!/indigo/i.test(content), 'Prohibited color "indigo" found in MovementCard.js');
    });
  });
});
