/**
 * Server-Side Routine Synchronization Service.
 * 
 * Shared synchronization engine used by both the Next.js Route Handler (/api/schedule/personal)
 * and the standalone CLI script (scripts/fetch-personal-schedule.mjs).
 * 
 * Data Integrity Guarantees:
 * - Scoped strictly to the provided userId.
 * - Idempotent upserts based on deterministic document IDs ({userId}_{stableKey}).
 * - Preserves user customizations (custom times, frequencies, checklists, notes).
 * - Never deletes or alters custom user habits or foundation preset habits.
 * - Never touches or resets /dailyLogs collection (historical completions & streaks preserved).
 */

import { adminDb } from './firebase-admin.js';
import { MANISH_PERSONAL_ROUTINES } from './personal-schedule.js';

/**
 * Synchronize personalized routine preset for a verified user.
 * 
 * @param {string} userId - The verified Firebase user UID
 * @returns {Promise<{ success: boolean, syncedCount: number, docIds: string[] }>}
 */
export async function syncPersonalSchedule(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required for synchronization.');
  }

  if (!adminDb) {
    throw new Error('Firebase Admin Firestore is not initialized. Check server credentials.');
  }

  // 1. Query existing habits for the user
  const snapshot = await adminDb.collection('habits').where('userId', '==', userId).get();
  const existingByStableKey = new Map();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.stableKey) {
      existingByStableKey.set(data.stableKey, { id: doc.id, ...data });
    }
  });

  const batch = adminDb.batch();
  const docIds = [];
  const now = new Date().toISOString();

  for (const routine of MANISH_PERSONAL_ROUTINES) {
    const docId = `${userId}_${routine.stableKey}`;
    const docRef = adminDb.collection('habits').doc(docId);
    docIds.push(docId);

    const existing = existingByStableKey.get(routine.stableKey);

    if (existing) {
      // Habit exists: Reconcile system metadata while strictly preserving user customizations
      const updatedData = {
        title: routine.title,
        category: routine.category,
        completionMethod: routine.completionMethod,
        instructions: routine.instructions,
        isSystemSeed: true,
        seedOrigin: 'personal_preset',
        userId,
        updatedAt: now,
        // Preserve user customizations if already customized:
        time: existing.time ?? routine.time,
        timingType: existing.timingType ?? routine.timingType,
        preferredPeriod: existing.preferredPeriod !== undefined ? existing.preferredPeriod : routine.preferredPeriod,
        relativeTiming: existing.relativeTiming !== undefined ? existing.relativeTiming : routine.relativeTiming,
        frequency: Array.isArray(existing.frequency) && existing.frequency.length > 0 ? existing.frequency : routine.frequency,
        order: existing.order ?? routine.order,
        // Preserve any user-added checklist items or local custom metadata
        checklistItems: Array.isArray(existing.checklistItems) && existing.checklistItems.length > 0
          ? existing.checklistItems
          : routine.checklistItems,
        metadata: {
          ...routine.metadata,
          ...(existing.metadata || {}),
        },
      };

      batch.set(docRef, updatedData, { merge: true });
    } else {
      // Habit does not exist: Insert full canonical routine record
      const newData = {
        ...routine,
        id: docId,
        userId,
        seedOrigin: 'personal_preset',
        createdAt: now,
        updatedAt: now,
      };

      batch.set(docRef, newData, { merge: true });
    }
  }

  // Commit all writes atomically in a single batch
  await batch.commit();

  return {
    success: true,
    syncedCount: MANISH_PERSONAL_ROUTINES.length,
    docIds,
  };
}
