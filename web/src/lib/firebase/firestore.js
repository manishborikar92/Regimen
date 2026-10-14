import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    query,
    where,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Build a Firestore query for a user's habits.
 * @param {string} userId
 */
export function getHabitsQuery(userId) {
    return query(
        collection(db, 'habits'),
        where('userId', '==', userId)
    );
}

/**
 * Get a reference to a user's daily log document.
 * Format: dailyLogs/{userId}_{dateStr}
 * @param {string} userId
 * @param {string} dateStr - Format: YYYY-MM-DD
 */
export function getDailyLogRef(userId, dateStr) {
    return doc(db, 'dailyLogs', `${userId}_${dateStr}`);
}

/**
 * Get reference to user profile / long-term progress document.
 * @param {string} userId
 */
export function getUserRef(userId) {
    return doc(db, 'users', userId);
}

/**
 * Create a new habit document.
 * @param {string} userId
 * @param {Object} habitData
 */
export async function createHabit(userId, habitData) {
    return addDoc(collection(db, 'habits'), {
        ...habitData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Update an existing habit document.
 * @param {string} habitId
 * @param {Object} habitData
 */
export async function updateHabitDoc(habitId, habitData) {
    return updateDoc(doc(db, 'habits', habitId), {
        ...habitData,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a habit document.
 * @param {string} habitId
 */
export async function deleteHabitDoc(habitId) {
    return deleteDoc(doc(db, 'habits', habitId));
}

/**
 * Toggle a habit's binary completion status for a given day.
 * Creates the daily log document if it doesn't exist.
 * @param {string} userId
 * @param {string} dateStr
 * @param {string} habitId
 * @param {boolean} isCurrentlyCompleted
 * @param {number} currentLogLength - Length of today's log
 */
export async function toggleHabitCompletion(userId, dateStr, habitId, isCurrentlyCompleted, currentLogLength = 0) {
    const dailyLogRef = getDailyLogRef(userId, dateStr);

    if (currentLogLength === 0 && !isCurrentlyCompleted) {
        // First completion of the day — create the document
        return setDoc(dailyLogRef, {
            userId,
            date: dateStr,
            completedHabitIds: [habitId],
            habitProgress: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }

    // Update existing document with arrayUnion / arrayRemove
    return setDoc(dailyLogRef, {
        userId,
        date: dateStr,
        completedHabitIds: isCurrentlyCompleted
            ? arrayRemove(habitId)
            : arrayUnion(habitId),
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

/**
 * Record granular progress for an activity (e.g., workbook session count, review done,
 * exercise checklist steps, reading timer, or private diary entry).
 * Idempotently updates the daily log and synchronizes binary completion.
 * 
 * @param {string} userId
 * @param {string} dateStr
 * @param {string} habitId
 * @param {Object} progressDetails - Granular activity details
 * @param {boolean} [isFullyCompleted] - Whether the activity now satisfies completion requirements
 */
export async function updateDailyHabitProgress(userId, dateStr, habitId, progressDetails, isFullyCompleted) {
    const dailyLogRef = getDailyLogRef(userId, dateStr);

    const updatePayload = {
        userId,
        date: dateStr,
        habitProgress: {
            [habitId]: {
                ...progressDetails,
                updatedAt: new Date().toISOString(),
            },
        },
        updatedAt: serverTimestamp(),
    };

    if (typeof isFullyCompleted === 'boolean') {
        updatePayload.completedHabitIds = isFullyCompleted ? arrayUnion(habitId) : arrayRemove(habitId);
    }

    return setDoc(dailyLogRef, updatePayload, { merge: true });
}

/**
 * Idempotent Seed: Seed or update canonical habits for a user.
 * Running this multiple times NEVER duplicates habits and NEVER wipes existing user records.
 * Uses deterministic document IDs derived from the routine's stableKey.
 * 
 * @param {string} userId
 * @param {Array<Object>} seedData
 * @returns {Promise<Array<string>>} List of document IDs upserted
 */
export async function seedHabitsForUser(userId, seedData) {
    if (!userId) throw new Error('User ID is required to seed routines.');
    if (!Array.isArray(seedData) || seedData.length === 0) return [];

    const promises = seedData.map(async (habit, index) => {
        // Deterministic document ID based on stableKey or index
        const key = habit.stableKey || `routine_${index + 1}`;
        const docId = `${userId}_${key}`;
        const habitRef = doc(db, 'habits', docId);

        // Fetch existing habit document to preserve user customizations
        const existingSnap = await getDoc(habitRef);
        let dataToSave;

        if (existingSnap.exists()) {
            const existing = existingSnap.data();
            dataToSave = {
                title: habit.title,
                category: habit.category,
                completionMethod: habit.completionMethod,
                instructions: habit.instructions,
                isSystemSeed: true,
                seedOrigin: habit.seedOrigin || 'foundation_preset',
                userId,
                updatedAt: serverTimestamp(),
                // Preserve user customizations
                time: existing.time ?? habit.time,
                timingType: existing.timingType ?? habit.timingType,
                preferredPeriod: existing.preferredPeriod !== undefined ? existing.preferredPeriod : habit.preferredPeriod,
                relativeTiming: existing.relativeTiming !== undefined ? existing.relativeTiming : habit.relativeTiming,
                frequency: Array.isArray(existing.frequency) && existing.frequency.length > 0 ? existing.frequency : habit.frequency,
                order: existing.order ?? habit.order,
                checklistItems: Array.isArray(existing.checklistItems) && existing.checklistItems.length > 0
                    ? existing.checklistItems
                    : habit.checklistItems,
                metadata: {
                    ...(habit.metadata || {}),
                    ...(existing.metadata || {}),
                },
            };
        } else {
            dataToSave = {
                ...habit,
                id: docId,
                userId,
                seedOrigin: habit.seedOrigin || 'foundation_preset',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
        }

        // merge: true preserves any extra custom fields
        await setDoc(habitRef, dataToSave, { merge: true });
        return docId;
    });

    return Promise.all(promises);
}

/**
 * Fetch historical daily logs for a user.
 * Queries by userId only (avoiding composite index requirement) and sorts safely in memory.
 * @param {string} userId
 * @returns {Promise<Object>} Map of dateStr -> { completedHabitIds: string[], habitProgress: Object }
 */
export async function fetchHistoricalLogs(userId) {
    const logsQuery = query(
        collection(db, 'dailyLogs'),
        where('userId', '==', userId)
    );
    const snapshot = await getDocs(logsQuery);

    const logsMap = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.date) {
            logsMap[data.date] = {
                completedHabitIds: data.completedHabitIds || [],
                habitProgress: data.habitProgress || {},
            };
        }
    });
    return logsMap;
}

/**
 * Fetch user preferences and long-term progress (e.g. 12-week exercise plan, Osho progress).
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function fetchUserProfile(userId) {
    if (!userId) return null;
    try {
        const userRef = getUserRef(userId);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (err) {
        console.error('Error fetching user profile:', err);
        return null;
    }
}

/**
 * Save user preferences or long-term progress (e.g. activate 12-week plan, save Osho progress).
 * @param {string} userId
 * @param {Object} data
 */
export async function saveUserProfile(userId, data) {
    if (!userId) return;
    const userRef = getUserRef(userId);
    return setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}
