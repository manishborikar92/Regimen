/**
 * Server-Side Routine Synchronization Service.
 * 
 * Synchronization engine used by the standalone CLI script (scripts/fetch-personal-schedule.mjs).
 * 
 * Data Integrity Guarantees:
 * - Scoped strictly to the provided userId.
 * - Stored in dedicated 'personalRoutines' collection, keeping generic web UI isolated.
 * - Idempotent upserts based on deterministic document IDs ({userId}_{stableKey}).
 * - Preserves user customizations (custom times, frequencies, checklists, notes).
 * - Migrates and removes any legacy personal routines from the public 'habits' collection.
 * - Never touches or resets /dailyLogs collection (historical completions & streaks preserved).
 */

import { adminDb } from './firebase-admin.js';
import { MANISH_PERSONAL_ROUTINES } from './personal-schedule.js';

/**
 * Synchronize personalized routine preset for a verified user.
 * Writes to 'personalRoutines' collection and ensures clean isolation from the public 'habits' collection.
 * 
 * @param {string} userId - The verified Firebase user UID
 * @returns {Promise<{ success: boolean, syncedCount: number, docIds: string[], migratedCount: number }>}
 */
export async function syncPersonalSchedule(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid userId is required for synchronization.');
  }

  if (!adminDb) {
    throw new Error('Firebase Admin Firestore is not initialized. Check server credentials.');
  }

  // 1. Query existing personal routines from personalRoutines collection
  const personalSnap = await adminDb.collection('personalRoutines').where('userId', '==', userId).get();
  const existingByStableKey = new Map();
  personalSnap.forEach(doc => {
    const data = doc.data();
    if (data.stableKey) {
      existingByStableKey.set(data.stableKey, { id: doc.id, ...data });
    }
  });

  // 2. Query legacy habits to migrate any existing customizations and clean up from public habits
  const habitsSnap = await adminDb.collection('habits').where('userId', '==', userId).get();
  const legacyHabitDocsToDelete = [];
  habitsSnap.forEach(doc => {
    const data = doc.data();
    if (data.stableKey && data.stableKey.startsWith('canonical_')) {
      legacyHabitDocsToDelete.push(doc.ref);
      if (!existingByStableKey.has(data.stableKey)) {
        existingByStableKey.set(data.stableKey, { id: doc.id, ...data });
      }
    }
  });

  const batch = adminDb.batch();
  const docIds = [];
  const now = new Date().toISOString();

  for (const routine of MANISH_PERSONAL_ROUTINES) {
    const docId = `${userId}_${routine.stableKey}`;
    const docRef = adminDb.collection('personalRoutines').doc(docId);
    docIds.push(docId);

    const existing = existingByStableKey.get(routine.stableKey);

    if (existing) {
      // Reconcile system metadata while strictly preserving user customizations
      const updatedData = {
        title: routine.title,
        category: routine.category,
        completionMethod: routine.completionMethod,
        instructions: routine.instructions,
        isSystemSeed: true,
        seedOrigin: 'personal_preset',
        userId,
        updatedAt: now,
        // Preserve user customizations:
        time: existing.time ?? routine.time,
        timingType: existing.timingType ?? routine.timingType,
        preferredPeriod: existing.preferredPeriod !== undefined ? existing.preferredPeriod : routine.preferredPeriod,
        relativeTiming: existing.relativeTiming !== undefined ? existing.relativeTiming : routine.relativeTiming,
        frequency: Array.isArray(existing.frequency) && existing.frequency.length > 0 ? existing.frequency : routine.frequency,
        order: existing.order ?? routine.order,
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

  // 3. Clean up legacy personal routines from 'habits' collection so public web UI only sees generic habits
  for (const legacyRef of legacyHabitDocsToDelete) {
    batch.delete(legacyRef);
  }

  // Commit all writes and cleanup atomically in a single batch
  await batch.commit();

  return {
    success: true,
    syncedCount: MANISH_PERSONAL_ROUTINES.length,
    docIds,
    migratedCount: legacyHabitDocsToDelete.length,
  };
}
