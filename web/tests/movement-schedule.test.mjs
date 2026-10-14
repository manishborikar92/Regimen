import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVEMENT_SCHEDULE,
  WORKOUT_EXERCISES,
  WALK_DAY_ROUTINE,
  PROGRESSION_PHASES,
  STOP_SIGNALS,
} from '../src/lib/fixtures/exercise-plan.js';

describe('12-Week Movement Plan & Weekday Schedule', () => {
  it('should map weekdays to the exact schedule specified in the brief', () => {
    // Mon, Wed, Fri: Strength workout (~30 min)
    ['Mon', 'Wed', 'Fri'].forEach(day => {
      const plan = MOVEMENT_SCHEDULE[day];
      assert.equal(plan.type, 'workout', `${day} must be a workout day`);
      assert.equal(plan.target, 'About 30 minutes');
    });

    // Tue, Thu, Sat: Easy walk + 3 stretches (10-20 min)
    ['Tue', 'Thu', 'Sat'].forEach(day => {
      const plan = MOVEMENT_SCHEDULE[day];
      assert.equal(plan.type, 'walk', `${day} must be a walk day`);
      assert.ok(plan.target.includes('10–20 minutes'), `${day} walk target must be 10-20 min`);
    });

    // Sun: Planned rest (No workout required)
    const sunday = MOVEMENT_SCHEDULE.Sun;
    assert.equal(sunday.type, 'rest', 'Sunday must be a planned rest day');
    assert.equal(sunday.target, 'No workout required');
  });

  it('should contain all 11 workout exercises across warmup, main, and cooldown phases', () => {
    assert.equal(WORKOUT_EXERCISES.length, 11);

    const warmups = WORKOUT_EXERCISES.filter(e => e.phase === 'warmup');
    const mains = WORKOUT_EXERCISES.filter(e => e.phase === 'main');
    const cooldowns = WORKOUT_EXERCISES.filter(e => e.phase === 'cooldown');

    assert.equal(warmups.length, 3, 'Must have 3 warmup exercises');
    assert.equal(mains.length, 5, 'Must have 5 main exercises');
    assert.equal(cooldowns.length, 3, 'Must have 3 cooldown stretches');

    // Verify key movements exist
    const names = WORKOUT_EXERCISES.map(e => e.name);
    assert.ok(names.includes('March in Place'));
    assert.ok(names.includes('Cat–Cow'));
    assert.ok(names.includes('Chin Tuck'));
    assert.ok(names.includes('Sit-to-Stand'));
    assert.ok(names.includes('Incline Push-Up'));
    assert.ok(names.includes('Glute Bridge'));
    assert.ok(names.includes('Prone Y–T Raise'));
    assert.ok(names.includes('Dead Bug'));
    assert.ok(names.includes('Doorway Chest Stretch'));
    assert.ok(names.includes('Hip Flexor Stretch'));
    assert.ok(names.includes("Child's Pose"));
  });

  it('should include the walk day routine with walk and 3 stretches', () => {
    assert.equal(WALK_DAY_ROUTINE.length, 4);
    assert.equal(WALK_DAY_ROUTINE[0].name, 'Easy Walk');
    assert.equal(WALK_DAY_ROUTINE[1].name, 'Doorway Chest Stretch');
    assert.equal(WALK_DAY_ROUTINE[2].name, 'Hip Flexor Stretch');
    assert.equal(WALK_DAY_ROUTINE[3].name, "Child's Pose");
  });

  it('should enforce medical check-up caution in weeks 1-4 progression guidance', () => {
    const phase1 = PROGRESSION_PHASES.find(p => p.weeks === '1–4');
    assert.ok(phase1, 'Phase 1–4 must exist');
    assert.ok(phase1.caution.includes('Medical check-up recommended within the first 4 weeks'));
    assert.ok(phase1.caution.includes('Stay at 2 sets until that check-up'));
  });

  it('should include essential stop signals for safety', () => {
    const joinedSignals = STOP_SIGNALS.join(' ').toLowerCase();
    assert.ok(joinedSignals.includes('chest pain'), 'Stop signals must include chest pain');
    assert.ok(joinedSignals.includes('faintness') || joinedSignals.includes('dizziness'), 'Stop signals must include dizziness');
    assert.ok(joinedSignals.includes('breathing'), 'Stop signals must include breathing difficulty');
    assert.ok(joinedSignals.includes('heartbeat'), 'Stop signals must include irregular heartbeat');
    assert.ok(joinedSignals.includes('joint') || joinedSignals.includes('sharp'), 'Stop signals must include sharp pain');
  });
});
