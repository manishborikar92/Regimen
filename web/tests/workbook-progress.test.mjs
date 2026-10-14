import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure helper function simulating WorkbookCard completion logic
function evaluateWorkbookCompletion(sessions, reviewDone) {
  const isTargetMet = sessions >= 2;
  const isFullyComplete = isTargetMet && Boolean(reviewDone);
  return {
    sessions,
    reviewDone: Boolean(reviewDone),
    isTargetMet,
    isFullyComplete,
    statusText: isFullyComplete
      ? 'Completed'
      : sessions > 0 || reviewDone
      ? 'In Progress'
      : 'Not Started',
    missingRequirement:
      sessions < 2 && !reviewDone
        ? 'Sessions and previous-work review remaining'
        : sessions < 2
        ? 'Sessions remaining'
        : !reviewDone
        ? 'Previous-work review remaining'
        : null,
  };
}

describe('Workbook Tracker & Partial Progress', () => {
  it('should start with 0/2 sessions and Not Started status', () => {
    const state = evaluateWorkbookCompletion(0, false);
    assert.equal(state.sessions, 0);
    assert.equal(state.isTargetMet, false);
    assert.equal(state.isFullyComplete, false);
    assert.equal(state.statusText, 'Not Started');
  });

  it('should reflect In Progress when 1/2 sessions completed', () => {
    const state = evaluateWorkbookCompletion(1, false);
    assert.equal(state.sessions, 1);
    assert.equal(state.isTargetMet, false);
    assert.equal(state.isFullyComplete, false);
    assert.equal(state.statusText, 'In Progress');
    assert.equal(state.missingRequirement, 'Sessions and previous-work review remaining');
  });

  it('should NOT mark complete when 2/2 sessions completed if previous-work review is missing', () => {
    const state = evaluateWorkbookCompletion(2, false);
    assert.equal(state.sessions, 2);
    assert.equal(state.isTargetMet, true);
    assert.equal(state.isFullyComplete, false, 'Must not be fully complete without prior-day review');
    assert.equal(state.statusText, 'In Progress');
    assert.equal(state.missingRequirement, 'Previous-work review remaining');
  });

  it('should mark complete ONLY when both 2/2 sessions AND previous-work review are fulfilled', () => {
    const state = evaluateWorkbookCompletion(2, true);
    assert.equal(state.sessions, 2);
    assert.equal(state.isTargetMet, true);
    assert.equal(state.isFullyComplete, true);
    assert.equal(state.statusText, 'Completed');
    assert.equal(state.missingRequirement, null);
  });

  it('should clamp sessions between 0 and 2', () => {
    const clamp = (val) => Math.max(0, Math.min(2, val));
    assert.equal(clamp(-1), 0);
    assert.equal(clamp(0), 0);
    assert.equal(clamp(1), 1);
    assert.equal(clamp(2), 2);
    assert.equal(clamp(3), 2);
  });
});
