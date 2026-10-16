import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getStepId,
  isStepCompleted,
  calculateChecklistProgress,
  toggleChecklistStep,
  toggleAllChecklistSteps,
  normalizeChecklistItems,
} from '../src/utils/checklist-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relPath) {
  return fs.readFileSync(path.join(webRoot, relPath), 'utf-8');
}

describe('Phase 4: Interactive Step Checklists & Workout Routine Consolidation', () => {
  describe('1. Checklist & Step Progress Helpers (Pure Invariants)', () => {
    const sampleItems = [
      { id: 'step_water', label: 'Drink 2 glasses of fresh water' },
      { label: '5 minutes of quiet breathing' }, // no id
      { label: 'Gentle neck & shoulder stretch' }, // no id
    ];

    it('should derive stable step IDs consistently', () => {
      // Existing id preserved
      assert.equal(getStepId(sampleItems[0], 0), 'step_water');
      // Label-slug fallback for items without id
      const id1 = getStepId(sampleItems[1], 1);
      assert.ok(id1.startsWith('step_5_minutes_of_quiet'), 'Must derive deterministic content slug');
      // Empty item fallback
      assert.equal(getStepId({}, 2), 'step_2');
      assert.equal(getStepId(null, 3), 'step_3');
    });

    it('should normalize checklist items with stable IDs', () => {
      const raw = [
        { label: 'Step 1' },
        { id: 'custom_id_2', label: 'Step 2' },
        { label: 'Step 1' }, // duplicate label
      ];
      const normalized = normalizeChecklistItems(raw);
      assert.equal(normalized.length, 3);
      assert.equal(normalized[0].id, 'step_step_1');
      assert.equal(normalized[1].id, 'custom_id_2');
      assert.equal(normalized[2].id, 'step_step_1_2', 'Duplicate label must have collision suffix');
      assert.equal(normalized[0].label, 'Step 1');
      assert.equal(normalized[1].label, 'Step 2');
    });

    it('should accurately verify step completion with backward compatibility', () => {
      // By exact id
      assert.ok(isStepCompleted(sampleItems[0], 0, ['step_water'], false));
      assert.ok(!isStepCompleted(sampleItems[0], 0, ['other_step'], false));

      // By numerical index (legacy)
      assert.ok(isStepCompleted(sampleItems[1], 1, [1], false));
      assert.ok(!isStepCompleted(sampleItems[1], 1, [0, 2], false));

      // By stringified index (legacy)
      assert.ok(isStepCompleted(sampleItems[2], 2, ['2'], false));

      // Legacy fallback: habit marked complete with empty completedSteps
      assert.ok(isStepCompleted(sampleItems[0], 0, [], true));
      assert.ok(isStepCompleted(sampleItems[1], 1, null, true));
      assert.ok(!isStepCompleted(sampleItems[0], 0, [], false));
    });

    it('should calculate checklist progress percentage and completion status', () => {
      // Empty items
      assert.deepEqual(
        calculateChecklistProgress([], [], false),
        { completedCount: 0, totalCount: 0, percent: 0, isAllCompleted: false }
      );

      // 0 of 3 completed
      const prog0 = calculateChecklistProgress(sampleItems, [], false);
      assert.equal(prog0.completedCount, 0);
      assert.equal(prog0.totalCount, 3);
      assert.equal(prog0.percent, 0);
      assert.equal(prog0.isAllCompleted, false);

      // 1 of 3 completed (33%)
      const prog1 = calculateChecklistProgress(sampleItems, ['step_water'], false);
      assert.equal(prog1.completedCount, 1);
      assert.equal(prog1.totalCount, 3);
      assert.equal(prog1.percent, 33);
      assert.equal(prog1.isAllCompleted, false);

      // 2 of 3 completed (67%)
      const step1Id = getStepId(sampleItems[1], 1);
      const prog2 = calculateChecklistProgress(sampleItems, ['step_water', step1Id], false);
      assert.equal(prog2.completedCount, 2);
      assert.equal(prog2.percent, 67);
      assert.equal(prog2.isAllCompleted, false);

      // All 3 completed (100%)
      const step2Id = getStepId(sampleItems[2], 2);
      const prog3 = calculateChecklistProgress(sampleItems, ['step_water', step1Id, step2Id], false);
      assert.equal(prog3.completedCount, 3);
      assert.equal(prog3.percent, 100);
      assert.equal(prog3.isAllCompleted, true);
    });

    it('should toggle individual steps and auto-complete when all are checked', () => {
      let state = [];

      // Check step 0
      const res0 = toggleChecklistStep(sampleItems, state, 0, false);
      assert.equal(res0.completedCount, 1);
      assert.equal(res0.isAllCompleted, false);
      assert.ok(res0.nextCompletedSteps.includes('step_water'));
      state = res0.nextCompletedSteps;

      // Check step 1
      const res1 = toggleChecklistStep(sampleItems, state, 1, false);
      assert.equal(res1.completedCount, 2);
      assert.equal(res1.isAllCompleted, false);
      state = res1.nextCompletedSteps;

      // Check step 2 -> all complete!
      const res2 = toggleChecklistStep(sampleItems, state, 2, false);
      assert.equal(res2.completedCount, 3);
      assert.equal(res2.percent, 100);
      assert.equal(res2.isAllCompleted, true, 'Checking last step must trigger isAllCompleted: true');
      state = res2.nextCompletedSteps;

      // Uncheck step 1 -> auto-reverses completion
      const resUncheck = toggleChecklistStep(sampleItems, state, 1, true);
      assert.equal(resUncheck.completedCount, 2);
      assert.equal(resUncheck.isAllCompleted, false, 'Unchecking any step must set isAllCompleted: false');
    });

    it('should seamlessly transition when unchecking a step from a legacy completed state', () => {
      // Habit is legacy completed (isHabitCompleted = true, completedSteps = [])
      // User unchecks step 0
      const res = toggleChecklistStep(sampleItems, [], 0, true);
      assert.equal(res.completedCount, 2, 'Unchecking step 0 leaves the other 2 steps checked');
      assert.equal(res.isAllCompleted, false, 'Habit is now incomplete');
      assert.ok(!res.nextCompletedSteps.includes('step_water'));
      assert.ok(res.nextCompletedSteps.includes(getStepId(sampleItems[1], 1)));
      assert.ok(res.nextCompletedSteps.includes(getStepId(sampleItems[2], 2)));
    });

    it('should support batch toggle for whole habit completion and reset', () => {
      const allDone = toggleAllChecklistSteps(sampleItems, true);
      assert.equal(allDone.completedCount, 3);
      assert.equal(allDone.percent, 100);
      assert.equal(allDone.isAllCompleted, true);
      assert.equal(allDone.nextCompletedSteps.length, 3);

      const allReset = toggleAllChecklistSteps(sampleItems, false);
      assert.equal(allReset.completedCount, 0);
      assert.equal(allReset.percent, 0);
      assert.equal(allReset.isAllCompleted, false);
      assert.deepEqual(allReset.nextCompletedSteps, []);
    });
  });

  describe('2. Step ID Stability Under Mutations (Rename, Reorder, Insert, Remove)', () => {
    it('should retain existing step IDs when a user renames an existing step', () => {
      const original = [
        { id: 'step_water_101', label: 'Drink 1 glass of water' },
        { id: 'step_stretch_102', label: 'Stretch for 5 min' },
      ];

      // User renames step 0 in HabitModal
      const renamed = original.map((item, idx) =>
        idx === 0 ? { ...item, label: 'Drink 2 tall glasses of cold water' } : item
      );

      assert.equal(renamed[0].id, 'step_water_101', 'ID must be retained identically after renaming');
      assert.equal(renamed[0].label, 'Drink 2 tall glasses of cold water');

      // Previously saved completedSteps using this ID still matches!
      assert.ok(isStepCompleted(renamed[0], 0, ['step_water_101'], false));
    });

    it('should preserve progress association when steps are reordered', () => {
      const items = [
        { id: 'step_A', label: 'Item A' },
        { id: 'step_B', label: 'Item B' },
      ];

      // Item B was completed previously
      const completedSteps = ['step_B'];

      // Reorder: move Item B to index 0, Item A to index 1
      const reordered = [items[1], items[0]];

      // Item at index 0 is now Item B
      assert.ok(isStepCompleted(reordered[0], 0, completedSteps, false), 'Item B at index 0 must still be completed');
      // Item at index 1 is Item A
      assert.ok(!isStepCompleted(reordered[1], 1, completedSteps, false), 'Item A at index 1 must NOT be completed');
    });

    it('should preserve progress association when a new step is inserted at the front', () => {
      const original = [
        { id: 'step_hydration', label: 'Hydrate' },
        { id: 'step_journal', label: 'Journal' },
      ];

      // Step Hydration was completed
      const completedSteps = ['step_hydration'];

      // User inserts a new step at index 0
      const inserted = [
        { id: 'step_new_wake_up', label: 'Wake up at 6am' },
        original[0],
        original[1],
      ];

      // Index 0 (new step) is not completed
      assert.ok(!isStepCompleted(inserted[0], 0, completedSteps, false), 'New step must be incomplete');
      // Index 1 (Hydration) remains completed
      assert.ok(isStepCompleted(inserted[1], 1, completedSteps, false), 'Hydration must retain completed status');
      // Index 2 (Journal) is not completed
      assert.ok(!isStepCompleted(inserted[2], 2, completedSteps, false), 'Journal must remain incomplete');
    });

    it('should not transfer completion when a completed step is removed', () => {
      const items = [
        { id: 'step_1', label: 'Step 1' },
        { id: 'step_2', label: 'Step 2' },
        { id: 'step_3', label: 'Step 3' },
      ];

      // Step 2 was completed
      const completedSteps = ['step_2'];

      // User removes Step 2
      const afterRemoval = [items[0], items[2]];

      // Step 1 (index 0) remains incomplete
      assert.ok(!isStepCompleted(afterRemoval[0], 0, completedSteps, false));
      // Step 3 (now index 1) must NOT inherit Step 2's completion!
      assert.ok(!isStepCompleted(afterRemoval[1], 1, completedSteps, false), 'Step 3 must not inherit removed step completion');
    });
  });

  describe('3. GenericHabitCard Interactive Checklist Architecture', () => {
    it('should verify GenericHabitCard exists and exports a memoized component', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(content.includes('export default memo(GenericHabitCard)'));
    });

    it('should verify GenericHabitCard accepts progress and onUpdateProgress props', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(content.includes('progress = {}'), 'Must accept progress prop');
      assert.ok(content.includes('onUpdateProgress'), 'Must accept onUpdateProgress prop');
    });

    it('should verify interactive checkboxes with accessible labels are rendered for steps', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(content.includes('type="checkbox"'), 'Must render checkbox inputs for steps');
      assert.ok(content.includes('aria-label='), 'Must provide accessible aria-label on step checkboxes');
      assert.ok(content.includes('focus:ring-teal-500') || content.includes('focus:ring-2'), 'Must provide visible focus ring on checkboxes');
      assert.ok(content.includes('htmlFor={inputId}'), 'Must associate label with checkbox inputId');
    });

    it('should verify progress count and dynamic progress bar markup in GenericHabitCard', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(
        content.includes('completedCount') && content.includes('totalCount') && content.includes('steps completed'),
        'Must display "X of Y steps completed" progress indicator'
      );
      assert.ok(
        content.includes('style={{ width: `${percent}%` }}'),
        'Must render dynamic visual progress bar'
      );
    });

    it('should verify GenericHabitCard does not write redundant completedCount or totalCount to progress payloads', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(
        !content.includes('completedCount: nextCompletedSteps.length'),
        'Must not write redundant completedCount to progress payloads'
      );
      assert.ok(
        !content.includes('totalCount: items.length'),
        'Must not write redundant totalCount to progress payloads'
      );
    });

    it('should verify primary circular completion button satisfies min 44x44px touch target', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      assert.ok(
        content.includes('w-11 h-11') || content.includes('min-h-[44px]'),
        'Primary toggle button must satisfy 44x44px WCAG touch target'
      );
    });

    it('should verify zero prohibited colors in GenericHabitCard', () => {
      const content = readWebFile('src/components/habits/GenericHabitCard.js');
      const prohibited = [
        'bg-indigo-', 'text-indigo-', 'border-indigo-',
        'bg-purple-', 'text-purple-', 'border-purple-',
        'bg-blue-600', 'text-blue-600',
      ];
      for (const token of prohibited) {
        assert.ok(!content.includes(token), `GenericHabitCard must not use prohibited token: ${token}`);
      }
    });
  });

  describe('4. DashboardPage Card Dispatch & Wiring', () => {
    it('should verify DashboardPage passes progress and onUpdateProgress to GenericHabitCard', () => {
      const content = readWebFile('src/app/(protected)/dashboard/page.js');
      assert.ok(
        content.includes('<GenericHabitCard') &&
        content.includes('progress={progress}') &&
        content.includes('onUpdateProgress={updateProgress}'),
        'DashboardPage must pass progress and onUpdateProgress to GenericHabitCard'
      );
    });
  });

  describe('5. HabitModal Step ID Stability, Renaming, and Reordering', () => {
    it('should verify HabitModal ensures stable IDs and normalizes checklist items', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(
        content.includes('normalizeChecklistItems'),
        'HabitModal must use normalizeChecklistItems'
      );
      assert.ok(
        content.includes('updateChecklistItemLabel') || content.includes('updateChecklistItem'),
        'HabitModal must allow editing checklist step descriptions'
      );
      assert.ok(
        content.includes('moveChecklistItem'),
        'HabitModal must support reordering checklist steps'
      );
    });
  });

  describe('6. Workout Routine Coordination (MovementCard)', () => {
    it('should verify MovementCard dispatches clean progress payload without redundant counters', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(
        content.includes('completedItemIds: updatedIds'),
        'MovementCard must emit completedItemIds'
      );
      assert.ok(
        !content.includes('completedCount: updatedIds.length'),
        'MovementCard must NOT write redundant completedCount to database'
      );
      assert.ok(
        !content.includes('totalCount: currentItems.length'),
        'MovementCard must NOT write redundant totalCount to database'
      );
    });

    it('should verify MovementCard preserves workout progression and safety rules', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(content.includes('MOVEMENT_SCHEDULE'), 'MovementCard must preserve MOVEMENT_SCHEDULE');
      assert.ok(content.includes('WORKOUT_EXERCISES'), 'MovementCard must preserve WORKOUT_EXERCISES');
      assert.ok(content.includes('STOP_SIGNALS'), 'MovementCard must preserve STOP_SIGNALS');
      assert.ok(content.includes('isSunday'), 'MovementCard must preserve planned rest day logic');
    });
  });

  describe('7. End-to-End Simulation of Real-World User Workflows', () => {
    it('should simulate partial step completion, persistence, rename, reorder, auto-complete, and uncheck', () => {
      const habitId = 'habit_custom_routine';

      // 1. User creates a checklist habit with 3 steps
      const habitDefinition = {
        id: habitId,
        title: 'Morning Awakening Routine',
        category: 'Reflection',
        checklistItems: normalizeChecklistItems([
          { label: 'Drink 500ml water' },
          { label: '5 minutes mindfulness breathing' },
          { label: 'Joint mobility stretches' },
        ]),
      };

      const step1Id = habitDefinition.checklistItems[0].id;
      const step2Id = habitDefinition.checklistItems[1].id;
      const step3Id = habitDefinition.checklistItems[2].id;

      assert.ok(step1Id && step2Id && step3Id, 'All steps must have stable IDs');

      // 2. User completes only step 1
      let todayLog = [];
      let habitProgress = {};

      const step1Result = toggleChecklistStep(habitDefinition.checklistItems, [], 0, false);
      habitProgress[habitId] = { completedSteps: step1Result.nextCompletedSteps };
      if (step1Result.isAllCompleted) todayLog.push(habitId);

      assert.equal(todayLog.includes(habitId), false, 'Habit is not completed yet with 1 of 3 steps');
      assert.deepEqual(habitProgress[habitId].completedSteps, [step1Id]);

      // 3. User navigates away and reloads (state restored from storage)
      const restoredCompletedSteps = [...habitProgress[habitId].completedSteps];
      assert.ok(
        isStepCompleted(habitDefinition.checklistItems[0], 0, restoredCompletedSteps, false),
        'Step 1 must remain completed across navigation and reload'
      );
      assert.ok(
        !isStepCompleted(habitDefinition.checklistItems[1], 1, restoredCompletedSteps, false),
        'Step 2 must remain incomplete'
      );

      // 4. User renames step 1 to 'Drink 750ml lukewarm water'
      habitDefinition.checklistItems[0].label = 'Drink 750ml lukewarm water';
      // Step ID is unchanged!
      assert.equal(habitDefinition.checklistItems[0].id, step1Id);
      // Progress remains associated!
      assert.ok(
        isStepCompleted(habitDefinition.checklistItems[0], 0, restoredCompletedSteps, false),
        'Renamed step must remain completed'
      );

      // 5. User reorders: moves step 1 down to index 1
      const reorderedItems = [
        habitDefinition.checklistItems[1],
        habitDefinition.checklistItems[0],
        habitDefinition.checklistItems[2],
      ];
      // Index 0 is now mindfulness breathing (incomplete)
      assert.ok(!isStepCompleted(reorderedItems[0], 0, restoredCompletedSteps, false));
      // Index 1 is water (completed)
      assert.ok(isStepCompleted(reorderedItems[1], 1, restoredCompletedSteps, false));

      // 6. User completes all remaining steps
      const step2Result = toggleChecklistStep(reorderedItems, restoredCompletedSteps, 0, false);
      const step3Result = toggleChecklistStep(reorderedItems, step2Result.nextCompletedSteps, 2, false);

      habitProgress[habitId] = { completedSteps: step3Result.nextCompletedSteps };
      if (step3Result.isAllCompleted) todayLog.push(habitId);

      assert.ok(todayLog.includes(habitId), 'Completing every step triggers automatic habit completion');
      assert.equal(step3Result.percent, 100);

      // 7. User unchecks one step
      const uncheckResult = toggleChecklistStep(reorderedItems, habitProgress[habitId].completedSteps, 1, true);
      habitProgress[habitId] = { completedSteps: uncheckResult.nextCompletedSteps };
      if (!uncheckResult.isAllCompleted) {
        todayLog = todayLog.filter(id => id !== habitId);
      }

      assert.ok(!todayLog.includes(habitId), 'Unchecking any step marks overall habit incomplete');
      assert.equal(uncheckResult.completedCount, 2);

      // 8. User clicks overall habit toggle to mark all complete
      const batchComplete = toggleAllChecklistSteps(reorderedItems, true);
      habitProgress[habitId] = { completedSteps: batchComplete.nextCompletedSteps };
      todayLog.push(habitId);

      assert.equal(batchComplete.completedCount, 3);
      assert.equal(batchComplete.percent, 100);
      assert.ok(todayLog.includes(habitId));

      // 9. User clicks overall habit toggle to mark all incomplete
      const batchReset = toggleAllChecklistSteps(reorderedItems, false);
      habitProgress[habitId] = { completedSteps: batchReset.nextCompletedSteps };
      todayLog = todayLog.filter(id => id !== habitId);

      assert.equal(batchReset.completedCount, 0);
      assert.deepEqual(habitProgress[habitId].completedSteps, []);
      assert.ok(!todayLog.includes(habitId));
    });
  });
});
