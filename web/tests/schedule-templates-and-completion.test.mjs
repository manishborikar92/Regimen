import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  SCHEDULE_TEMPLATES,
  validateScheduleTemplate,
} from '../src/lib/server/schedule-templates.js';
import {
  clampCounterProgress,
  deriveCompletedProgressForHabit,
  deriveUncompletedProgressForHabit,
  evaluateHabitCompletion,
  isFeatureSatisfied,
} from '../src/lib/constants/habit-models.js';
import { CATEGORIES } from '../src/lib/constants/categories.js';

describe('Schedule Templates & Reusable Blueprints', () => {
  it('should define exactly 12 authoritative schedule templates across canonical categories', () => {
    assert.strictEqual(SCHEDULE_TEMPLATES.length, 12, 'Must contain 12 consolidated blueprints');

    const ids = new Set();
    for (const t of SCHEDULE_TEMPLATES) {
      assert.ok(t.id.startsWith('template_'), `Template id must start with template_: ${t.id}`);
      assert.ok(!ids.has(t.id), `Template IDs must be collision-free: ${t.id}`);
      ids.add(t.id);

      assert.ok(t.title && t.title.trim().length > 0, `Template title required: ${t.id}`);
      assert.ok(CATEGORIES.includes(t.category), `Category must be one of 9 canonical categories: ${t.category}`);

      const val = validateScheduleTemplate(t);
      assert.strictEqual(val.valid, true, `Template ${t.id} must pass validation: ${val.errors.join('; ')}`);
    }
  });

  it('should verify all 6 feature slots are explicitly defined across all templates', () => {
    for (const t of SCHEDULE_TEMPLATES) {
      assert.ok(t.features, `Features object required on ${t.id}`);
      assert.ok('counter' in t.features, `Counter slot required on ${t.id}`);
      assert.ok('timer' in t.features, `Timer slot required on ${t.id}`);
      assert.ok('checklist' in t.features, `Checklist slot required on ${t.id}`);
      assert.ok('notes' in t.features, `Notes slot required on ${t.id}`);
      assert.ok('catalog' in t.features, `Catalog slot required on ${t.id}`);
      assert.ok('daySchedule' in t.features, `DaySchedule slot required on ${t.id}`);

      // Mutual exclusivity
      if (t.features.catalog.enabled) {
        assert.strictEqual(t.features.daySchedule.enabled, false, 'Catalog and DaySchedule cannot both be enabled');
      }
    }
  });
});

describe('Counter Stepper Upper-Bound Clamping & Lower-Bound Protection', () => {
  const counterHabit = {
    id: 'habit_counter_test',
    features: {
      counter: {
        enabled: true,
        targetCount: 2,
        maxCount: 2,
        minCount: 0,
        unit: 'sessions',
        step: 1,
      },
    },
  };

  it('should enforce targetCount / maxCount as hard upper bound', () => {
    assert.strictEqual(clampCounterProgress(counterHabit, 0), 0);
    assert.strictEqual(clampCounterProgress(counterHabit, 1), 1);
    assert.strictEqual(clampCounterProgress(counterHabit, 2), 2);
    // Attempts to exceed maxCount must be clamped
    assert.strictEqual(clampCounterProgress(counterHabit, 3), 2);
    assert.strictEqual(clampCounterProgress(counterHabit, 99), 2);
  });

  it('should enforce minCount as hard lower bound', () => {
    assert.strictEqual(clampCounterProgress(counterHabit, -1), 0);
    assert.strictEqual(clampCounterProgress(counterHabit, -10), 0);
  });

  it('should clamp properly when targetCount differs from maxCount', () => {
    const habitWithHigherMax = {
      id: 'habit_stepper_max',
      features: {
        counter: {
          enabled: true,
          targetCount: 4,
          maxCount: 8,
          minCount: 1,
          unit: 'glasses',
        },
      },
    };

    assert.strictEqual(clampCounterProgress(habitWithHigherMax, 0), 1); // clamped to minCount: 1
    assert.strictEqual(clampCounterProgress(habitWithHigherMax, 4), 4);
    assert.strictEqual(clampCounterProgress(habitWithHigherMax, 7), 7);
    assert.strictEqual(clampCounterProgress(habitWithHigherMax, 8), 8);
    assert.strictEqual(clampCounterProgress(habitWithHigherMax, 15), 8); // clamped to maxCount: 8
  });
});

describe('Bidirectional Aggregate Completion Behavior', () => {
  const multiFeatureHabit = {
    id: 'habit_multi_test',
    features: {
      counter: { enabled: true, targetCount: 2, unit: 'sessions', minCount: 0 },
      checklist: {
        enabled: true,
        items: [
          { id: 'step_1', label: 'Required Step 1', isRequired: true },
          { id: 'step_2', label: 'Required Step 2', isRequiredForCompletion: true },
          { id: 'step_opt', label: 'Optional Reflection Step', isRequired: false },
        ],
      },
      notes: { enabled: true, isPrivateDiary: false },
    },
  };

  it('should mark all required items complete when activating parent checkbox', () => {
    const existingProgress = {
      sessionsCompleted: 0,
      completedSteps: [],
      notes: 'Initial personal thought',
    };

    const derived = deriveCompletedProgressForHabit(multiFeatureHabit, existingProgress);

    assert.strictEqual(derived.sessionsCompleted, 2, 'Counter target must be fulfilled');
    assert.strictEqual(derived.count, 2);
    assert.ok(derived.completedSteps.includes('step_1'), 'Required step 1 completed');
    assert.ok(derived.completedSteps.includes('step_2'), 'Required step 2 completed');
    assert.strictEqual(derived.reviewDone, true);

    // Notes preservation invariant
    assert.strictEqual(derived.notes, 'Initial personal thought', 'Notes text MUST NOT be cleared or overwritten');

    // Aggregate completion evaluation
    const isComplete = evaluateHabitCompletion(multiFeatureHabit, derived);
    assert.strictEqual(isComplete, true, 'All required features fulfilled');
  });

  it('should reverse all required items when unchecking parent checkbox while preserving notes', () => {
    const completedProgress = {
      sessionsCompleted: 2,
      count: 2,
      completedSteps: ['step_1', 'step_2', 'step_opt'],
      reviewDone: true,
      notes: 'Important reflective notes',
    };

    const uncompleted = deriveUncompletedProgressForHabit(multiFeatureHabit, completedProgress);

    assert.strictEqual(uncompleted.sessionsCompleted, 0);
    assert.strictEqual(uncompleted.count, 0);
    assert.deepStrictEqual(uncompleted.completedSteps, []);
    assert.strictEqual(uncompleted.reviewDone, false);

    // Notes must be strictly preserved
    assert.strictEqual(uncompleted.notes, 'Important reflective notes');

    // Must evaluate to not completed
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, uncompleted), false);
  });

  it('should NOT complete parent prematurely when only one child item is completed', () => {
    // 1 session done, checklist not done
    const partial1 = { sessionsCompleted: 1, completedSteps: [] };
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, partial1), false);

    // 2 sessions done, but required checklist step 2 is missing
    const partial2 = { sessionsCompleted: 2, completedSteps: ['step_1'] };
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, partial2), false);

    // Checklist complete, but counter not at target
    const partial3 = { sessionsCompleted: 1, completedSteps: ['step_1', 'step_2'] };
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, partial3), false);
  });

  it('should complete parent when ALL required items are satisfied individually, even if optional step is incomplete', () => {
    const allRequiredDone = {
      sessionsCompleted: 2,
      completedSteps: ['step_1', 'step_2'], // step_opt (isRequired: false) is omitted
    };

    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, allRequiredDone), true);
  });

  it('should reverse parent completion when unchecking a single required child step', () => {
    const initiallyDone = {
      sessionsCompleted: 2,
      completedSteps: ['step_1', 'step_2'],
    };
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, initiallyDone), true);

    // User unchecks step_1
    const step1Reversed = {
      sessionsCompleted: 2,
      completedSteps: ['step_2'],
    };
    assert.strictEqual(evaluateHabitCompletion(multiFeatureHabit, step1Reversed), false);
  });

  it('should verify Osho Catalog completion promise: checking parent does NOT mark all 30 discourses listened', () => {
    const catalogHabit = {
      id: 'habit_osho_test',
      features: {
        catalog: {
          enabled: true,
          catalogId: 'osho_discourses',
          catalogTitle: 'Osho Discourses',
          totalItems: 30,
        },
      },
    };

    const initialProgress = {
      catalogItemCompleted: false,
      talkCompleted: false,
      seriesProgress: {
        osho_series_1: { completedTalks: 3, totalTalks: 10 },
      },
    };

    const parentCompleted = deriveCompletedProgressForHabit(catalogHabit, initialProgress);

    assert.strictEqual(parentCompleted.catalogItemCompleted, true, 'Daily observance marked complete');
    assert.strictEqual(parentCompleted.talkCompleted, true);
    // Lifetime series progress MUST remain completely intact
    assert.deepStrictEqual(
      parentCompleted.seriesProgress,
      { osho_series_1: { completedTalks: 3, totalTalks: 10 } },
      'Series progress MUST NOT be modified or mark all 30 discourses complete'
    );
  });
});
