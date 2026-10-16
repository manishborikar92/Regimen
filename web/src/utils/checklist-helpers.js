/**
 * Checklist & Step Progress Helpers.
 *
 * Provides shared, pure, fully testable utilities for interactive step checklists,
 * progress calculations, backward-compatible completion detection, and step toggling.
 *
 * Supported Data Contracts:
 * - habit.checklistItems: Array of { id?: string, label: string }
 * - dailyLogs.habitProgress[habitId]: {
 *     completedSteps: string[], // array of step IDs or indices
 *     completedCount: number,
 *     totalCount: number,
 *     ...
 *   }
 */

/**
 * Derives a stable, deterministic step identifier for a checklist item.
 * If an explicit `id` or `key` is present on the item, it is strictly preserved.
 * For legacy items without an ID, a content-based slug is derived so the ID
 * remains stable across reordering or insertion.
 *
 * @param {Object} item - Checklist item object
 * @param {number} [index=0] - Fallback index within checklistItems array
 * @returns {string} Stable identifier string
 */
export function getStepId(item, index = 0) {
  if (item && item.id) return String(item.id);
  if (item && item.key) return String(item.key);

  const labelSlug = String(item?.label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);

  return labelSlug ? `step_${labelSlug}` : `step_${index}`;
}

/**
 * Normalizes an array of checklist items to guarantee stable, persistent IDs.
 * Retains existing IDs without regeneration.
 * Generates deterministic slug IDs for legacy items missing IDs.
 *
 * @param {Array<Object|string>} items - Raw checklist items
 * @returns {Array<{ id: string, label: string }>} Normalized checklist items with stable IDs
 */
export function normalizeChecklistItems(items = []) {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set();

  return items.map((item, index) => {
    if (!item) {
      const fallbackId = `step_${index}`;
      seenIds.add(fallbackId);
      return { id: fallbackId, label: '' };
    }

    const label = typeof item === 'string' ? item : (item.label || '');
    let id = item.id || item.key;

    if (!id) {
      const slug = String(label)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 32);

      const base = slug ? `step_${slug}` : `step_${index}`;
      id = base;
      let counter = 1;
      while (seenIds.has(id)) {
        counter++;
        id = `${base}_${counter}`;
      }
    }

    const finalId = String(id);
    seenIds.add(finalId);

    return {
      ...(typeof item === 'object' ? item : {}),
      id: finalId,
      label: String(label),
    };
  });
}

/**
 * Determines whether a specific step is completed.
 * Fully backward-compatible with:
 * - Stable step ID strings (e.g. 'step_water', 'step_drink_1_2_glasses')
 * - Legacy index-prefixed slug strings (e.g. 'step_0_water')
 * - Numerical indices (e.g. 0, 1, 2)
 * - Stringified numerical indices (e.g. '0', '1', '2')
 * - Legacy boolean completion: if isHabitCompleted is true and no step progress was saved,
 *   all steps default to checked.
 *
 * @param {Object} item - Checklist item
 * @param {number} index - Item index
 * @param {Array<string|number>} [completedSteps=[]] - Persisted completedSteps array
 * @param {boolean} [isHabitCompleted=false] - Whether the overall habit is completed
 * @returns {boolean}
 */
export function isStepCompleted(item, index, completedSteps = [], isHabitCompleted = false) {
  const stepId = getStepId(item, index);

  if (Array.isArray(completedSteps) && completedSteps.length > 0) {
    if (completedSteps.includes(stepId)) return true;
    if (item?.id && completedSteps.includes(String(item.id))) return true;

    // Backward-compatible check for legacy index-prefixed slug
    const legacyIndexSlug = `step_${index}_${String(item?.label || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}`;
    if (completedSteps.includes(legacyIndexSlug)) return true;

    // Backward-compatible fallback for legacy numeric index logs
    if (completedSteps.includes(index)) return true;
    if (completedSteps.includes(String(index))) return true;
    return false;
  }

  // Legacy fallback: habit was marked complete via binary toggle without step progress
  if (isHabitCompleted) {
    return true;
  }

  return false;
}

/**
 * Calculates current progress stats for a checklist.
 *
 * @param {Array<Object>} [items=[]] - Array of checklist items
 * @param {Array<string|number>} [completedSteps=[]] - Completed steps
 * @param {boolean} [isHabitCompleted=false] - Whether the overall habit is completed
 * @returns {{ completedCount: number, totalCount: number, percent: number, isAllCompleted: boolean }}
 */
export function calculateChecklistProgress(items = [], completedSteps = [], isHabitCompleted = false) {
  const checklist = Array.isArray(items) ? items : [];
  const totalCount = checklist.length;

  if (totalCount === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      percent: isHabitCompleted ? 100 : 0,
      isAllCompleted: Boolean(isHabitCompleted),
    };
  }

  let completedCount = 0;
  for (let i = 0; i < totalCount; i++) {
    if (isStepCompleted(checklist[i], i, completedSteps, isHabitCompleted)) {
      completedCount++;
    }
  }

  const percent = Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
  const isAllCompleted = completedCount === totalCount;

  return {
    completedCount,
    totalCount,
    percent,
    isAllCompleted,
  };
}

/**
 * Toggles a single checklist step and computes the next state.
 * Correctly transitions from legacy full-habit completion if user unchecks a step.
 *
 * @param {Array<Object>} items - Array of checklist items
 * @param {Array<string|number>} currentCompletedSteps - Current completedSteps
 * @param {number} targetIndex - Index of the step to toggle
 * @param {boolean} [isHabitCompleted=false] - Current overall completion state
 * @returns {{ nextCompletedSteps: string[], completedCount: number, totalCount: number, percent: number, isAllCompleted: boolean }}
 */
export function toggleChecklistStep(items = [], currentCompletedSteps = [], targetIndex, isHabitCompleted = false) {
  const checklist = Array.isArray(items) ? items : [];
  const totalCount = checklist.length;
  if (totalCount === 0 || targetIndex < 0 || targetIndex >= totalCount) {
    return {
      nextCompletedSteps: currentCompletedSteps || [],
      completedCount: 0,
      totalCount,
      percent: 0,
      isAllCompleted: false,
    };
  }

  const targetItem = checklist[targetIndex];
  const targetId = getStepId(targetItem, targetIndex);
  const wasChecked = isStepCompleted(targetItem, targetIndex, currentCompletedSteps, isHabitCompleted);

  // If transitioning from a legacy completed state where completedSteps was empty/unrecorded,
  // expand all steps first so only targetIndex is unchecked
  let baseSteps;
  if (isHabitCompleted && (!currentCompletedSteps || currentCompletedSteps.length === 0)) {
    baseSteps = checklist.map((it, idx) => getStepId(it, idx));
  } else {
    // Normalize currentCompletedSteps to canonical IDs
    baseSteps = (currentCompletedSteps || []).map((id, idx) => {
      if (typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id))) {
        const numIdx = parseInt(id, 10);
        if (numIdx >= 0 && numIdx < checklist.length) {
          return getStepId(checklist[numIdx], numIdx);
        }
      }
      return String(id);
    });
  }

  let nextCompletedSteps;
  if (wasChecked) {
    // Remove target step identifier and its legacy index equivalents
    nextCompletedSteps = baseSteps.filter(id => {
      if (id === targetId) return false;
      if (targetItem?.id && id === String(targetItem.id)) return false;
      if (id === targetIndex || id === String(targetIndex)) return false;
      return true;
    });
  } else {
    // Add target step identifier
    nextCompletedSteps = [...baseSteps.filter(id => id !== targetId), targetId];
  }

  const { completedCount, percent, isAllCompleted } = calculateChecklistProgress(
    checklist,
    nextCompletedSteps,
    false // explicitly evaluate against newly calculated steps
  );

  return {
    nextCompletedSteps,
    completedCount,
    totalCount,
    percent,
    isAllCompleted,
  };
}

/**
 * Batch toggle all steps for whole-habit completion or reset.
 *
 * @param {Array<Object>} items - Array of checklist items
 * @param {boolean} shouldComplete - True to check all, false to uncheck all
 * @returns {{ nextCompletedSteps: string[], completedCount: number, totalCount: number, percent: number, isAllCompleted: boolean }}
 */
export function toggleAllChecklistSteps(items = [], shouldComplete) {
  const checklist = Array.isArray(items) ? items : [];
  const totalCount = checklist.length;

  if (!shouldComplete || totalCount === 0) {
    return {
      nextCompletedSteps: [],
      completedCount: 0,
      totalCount,
      percent: 0,
      isAllCompleted: false,
    };
  }

  const nextCompletedSteps = checklist.map((it, idx) => getStepId(it, idx));
  return {
    nextCompletedSteps,
    completedCount: totalCount,
    totalCount,
    percent: 100,
    isAllCompleted: true,
  };
}
