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
      assert.ok(id1.startsWith('step_1_5_minutes_of_quiet'), 'Must derive deterministic slug');
      // Empty item fallback
      assert.equal(getStepId({}, 2), 'step_2_2');
      assert.equal(getStepId(null, 3), 'step_3_3');
    });

    it('should accurately verify step completion with backward compatibility', () => {
      // By exact id
      assert.ok(isStepCompleted(sampleItems[0], 0, ['step_water'], false));
      assert.ok(!isStepCompleted(sampleItems[0], 0, ['other_step'], false));

      // By numerical index
      assert.ok(isStepCompleted(sampleItems[1], 1, [1], false));
      assert.ok(!isStepCompleted(sampleItems[1], 1, [0, 2], false));

      // By stringified index
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

  describe('2. GenericHabitCard Interactive Checklist Architecture', () => {
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

  describe('3. DashboardPage Card Dispatch & Wiring', () => {
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

  describe('4. HabitModal Step ID Stability', () => {
    it('should verify HabitModal ensures stable IDs for checklist items', () => {
      const content = readWebFile('src/components/habits/HabitModal.js');
      assert.ok(
        content.includes('id: stableId') || content.includes('item.id || `step_'),
        'HabitModal must assign stable IDs to checklist items'
      );
    });
  });

  describe('5. Workout Routine Coordination (MovementCard)', () => {
    it('should verify MovementCard harmonizes completedCount and totalCount in progress payloads', () => {
      const content = readWebFile('src/components/habits/MovementCard.js');
      assert.ok(
        content.includes('completedCount: updatedIds.length') &&
        content.includes('totalCount: currentItems.length'),
        'MovementCard must emit completedCount and totalCount matching checklist progress schema'
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

  describe('6. Daily Log Progress Model Lifecycle & Isolation', () => {
    it('should simulate full checklist completion and unchecking in dailyLog state', () => {
      const habitId = 'habit_morning_routine';
      const items = [
        { id: 'step_1', label: 'Hydrate' },
        { id: 'step_2', label: 'Stretch' },
      ];

      // Simulated local state
      const state = {
        todayLog: [],
        habitProgress: {},
      };

      // Step 1 checked
      const step1Toggle = toggleChecklistStep(items, [], 0, false);
      state.habitProgress[habitId] = {
        completedSteps: step1Toggle.nextCompletedSteps,
        completedCount: step1Toggle.completedCount,
        totalCount: step1Toggle.totalCount,
      };
      if (step1Toggle.isAllCompleted) {
        state.todayLog.push(habitId);
      }
      assert.equal(state.todayLog.includes(habitId), false, 'Habit must not be complete with 1/2 steps');
      assert.equal(state.habitProgress[habitId].completedCount, 1);

      // Step 2 checked -> auto-completed
      const step2Toggle = toggleChecklistStep(items, state.habitProgress[habitId].completedSteps, 1, false);
      state.habitProgress[habitId] = {
        completedSteps: step2Toggle.nextCompletedSteps,
        completedCount: step2Toggle.completedCount,
        totalCount: step2Toggle.totalCount,
      };
      if (step2Toggle.isAllCompleted && !state.todayLog.includes(habitId)) {
        state.todayLog.push(habitId);
      }
      assert.equal(state.todayLog.includes(habitId), true, 'Habit must auto-complete when all steps are done');
      assert.equal(state.habitProgress[habitId].completedCount, 2);

      // Step 1 unchecked -> auto-uncompleted
      const step1Uncheck = toggleChecklistStep(items, state.habitProgress[habitId].completedSteps, 0, true);
      state.habitProgress[habitId] = {
        completedSteps: step1Uncheck.nextCompletedSteps,
        completedCount: step1Uncheck.completedCount,
        totalCount: step1Uncheck.totalCount,
      };
      if (!step1Uncheck.isAllCompleted) {
        state.todayLog = state.todayLog.filter(id => id !== habitId);
      }
      assert.equal(state.todayLog.includes(habitId), false, 'Habit must mark incomplete when a step is unchecked');
      assert.equal(state.habitProgress[habitId].completedCount, 1);
    });
  });
});
