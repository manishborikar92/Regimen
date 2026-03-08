import {
    collection,
    doc,
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
 * Build a Firestore query for a user's habits, ordered by `order`.
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
 * @param {string} userId
 * @param {string} dateStr - Format: YYYY-MM-DD
 */
export function getDailyLogRef(userId, dateStr) {
    return doc(db, 'dailyLogs', `${userId}_${dateStr}`);
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
 * Toggle a habit's completion status for a given day.
 * Creates the daily log document if it doesn't exist.
 * @param {string} userId
 * @param {string} dateStr
 * @param {string} habitId
 * @param {boolean} isCurrentlyCompleted
 * @param {number} currentLogLength - Length of today's log (to determine create vs update)
 */
export async function toggleHabitCompletion(userId, dateStr, habitId, isCurrentlyCompleted, currentLogLength) {
    const dailyLogRef = getDailyLogRef(userId, dateStr);

    if (currentLogLength === 0 && !isCurrentlyCompleted) {
        // First completion of the day — create the document
        return setDoc(dailyLogRef, {
            userId,
            date: dateStr,
            completedHabitIds: [habitId],
            createdAt: serverTimestamp(),
        });
    }

    // Update existing document
    return updateDoc(dailyLogRef, {
        completedHabitIds: isCurrentlyCompleted
            ? arrayRemove(habitId)
            : arrayUnion(habitId),
    });
}

/**
 * Seed multiple habits at once for a user.
 * @param {string} userId
 * @param {Array<Object>} seedData
 */
export async function seedHabitsForUser(userId, seedData) {
    const promises = seedData.map(habit =>
        addDoc(collection(db, 'habits'), {
            ...habit,
            userId,
            createdAt: serverTimestamp(),
        })
    );
    return Promise.all(promises);
}

/**
 * Fetch historical daily logs for a user.
 * @param {string} userId
 * @returns {Promise<Object>} Map of dateStr -> completedHabitIds[]
 */
export async function fetchHistoricalLogs(userId) {
    const logsQuery = query(
        collection(db, 'dailyLogs'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(logsQuery);

    const logsMap = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        logsMap[data.date] = data.completedHabitIds || [];
    });
    return logsMap;
}
