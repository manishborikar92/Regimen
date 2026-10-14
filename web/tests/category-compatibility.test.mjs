import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_CATEGORIES,
  LEGACY_CATEGORIES,
  ALL_CATEGORIES,
  CATEGORIES,
  getCategoryConfig,
} from '../src/lib/constants/categories.js';

describe('Category Integrity & Firestore Rule Conformance', () => {
  it('should define all 6 canonical life-area categories', () => {
    assert.equal(CANONICAL_CATEGORIES.length, 6);
    assert.deepEqual(CANONICAL_CATEGORIES, [
      'English Learning',
      'Movement & Strength',
      'Listening & Awareness',
      'Reading',
      'Communication',
      'Reflection',
    ]);
  });

  it('should preserve foundational categories for backward compatibility', () => {
    assert.equal(LEGACY_CATEGORIES.length, 4);
    assert.deepEqual(LEGACY_CATEGORIES, [
      'Schedule',
      'Movement',
      'Nutrition',
      'Recovery',
    ]);
  });

  it('should ensure ALL_CATEGORIES and CATEGORIES contain all 10 allowed categories', () => {
    assert.equal(ALL_CATEGORIES.length, 10);
    assert.deepEqual(CATEGORIES, ALL_CATEGORIES);

    // Matches the exact whitelist in firestore.rules isValidCategory()
    const firestoreAllowedCategories = [
      'English Learning',
      'Movement & Strength',
      'Listening & Awareness',
      'Reading',
      'Communication',
      'Reflection',
      'Schedule',
      'Movement',
      'Nutrition',
      'Recovery',
    ];

    for (const cat of firestoreAllowedCategories) {
      assert.ok(ALL_CATEGORIES.includes(cat), `ALL_CATEGORIES must include ${cat}`);
    }
  });

  it('should provide full styling configuration for every supported category', () => {
    for (const cat of ALL_CATEGORIES) {
      const config = getCategoryConfig(cat);
      assert.ok(config, `Config for ${cat} must exist`);
      assert.ok(config.label, `Config for ${cat} must have a label`);
      assert.ok(config.borderColor, `Config for ${cat} must have a borderColor`);
      assert.ok(config.bgColor, `Config for ${cat} must have a bgColor`);
      assert.ok(config.textColor, `Config for ${cat} must have a textColor`);
      assert.ok(config.iconName, `Config for ${cat} must have an iconName`);
    }
  });

  it('should fallback safely for unknown or empty categories without crashing', () => {
    const nullConfig = getCategoryConfig(null);
    assert.equal(nullConfig.label, 'General');

    const emptyConfig = getCategoryConfig('');
    assert.equal(emptyConfig.label, 'General');

    const customConfig = getCategoryConfig('Custom Habit');
    assert.equal(customConfig.label, 'Custom Habit');
  });
});
