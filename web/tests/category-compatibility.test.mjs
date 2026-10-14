import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIES,
  CATEGORY_CONFIG,
  getCategoryConfig,
} from '../src/lib/constants/categories.js';

describe('Category Architecture & Firestore Rule Conformance', () => {
  it('should derive CATEGORIES directly from CATEGORY_CONFIG as the single source of truth', () => {
    assert.deepEqual(
      CATEGORIES,
      Object.keys(CATEGORY_CONFIG),
      'CATEGORIES must directly match the keys of CATEGORY_CONFIG'
    );
    assert.equal(CATEGORIES.length, 10, 'Must have exactly 10 supported categories');
  });

  it('should match the exact category whitelist in firestore.rules isValidCategory()', () => {
    // Exact whitelist from firestore.rules
    const firestoreAllowedCategories = [
      'English Learning',
      'Movement & Strength',
      'Listening & Awareness',
      'Reading',
      'Communication',
      'Reflection',
      'Movement',
      'Nutrition',
      'Recovery',
      'Schedule',
    ];

    assert.equal(
      CATEGORIES.length,
      firestoreAllowedCategories.length,
      'Category count must match firestore.rules whitelist count'
    );

    for (const cat of firestoreAllowedCategories) {
      assert.ok(
        CATEGORIES.includes(cat),
        `CATEGORIES must include ${cat} to satisfy Firestore rules`
      );
    }
  });

  it('should provide complete, valid styling tokens for every category without legacy labels', () => {
    for (const cat of CATEGORIES) {
      const config = getCategoryConfig(cat);
      assert.ok(config, `Config for ${cat} must exist`);
      assert.ok(config.label, `Config for ${cat} must have a label`);
      assert.ok(!config.label.includes('(Legacy)'), `Label for ${cat} must not contain '(Legacy)'`);
      assert.ok(config.borderColor, `Config for ${cat} must have a borderColor`);
      assert.ok(config.bgColor, `Config for ${cat} must have a bgColor`);
      assert.ok(config.badgeClasses, `Config for ${cat} must have badgeClasses`);
      assert.ok(config.textColor, `Config for ${cat} must have a textColor`);
      assert.ok(config.dotColor, `Config for ${cat} must have a dotColor`);
      assert.ok(config.iconName, `Config for ${cat} must have an iconName`);
      assert.ok(config.description, `Config for ${cat} must have a description`);
    }
  });

  it('should fallback safely for unknown or empty categories without crashing', () => {
    const nullConfig = getCategoryConfig(null);
    assert.equal(nullConfig.label, 'General');

    const emptyConfig = getCategoryConfig('');
    assert.equal(emptyConfig.label, 'General');

    const customConfig = getCategoryConfig('Custom Habit');
    assert.equal(customConfig.label, 'Custom Habit');
    assert.equal(customConfig.iconName, 'CheckCircle2');
  });
});
