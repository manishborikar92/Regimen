'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase app, auth, Firestore, and Google provider instances.
 * Initialized lazily and only on the client-side.
 */
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);

    // Use modern persistent cache instead of deprecated enableIndexedDbPersistence
    db = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentSingleTabManager({ forceOwnership: false }),
        }),
    });

    googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, googleProvider };
