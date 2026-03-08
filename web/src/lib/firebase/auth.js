import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Sign in with Google via Firebase popup.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGoogle() {
    if (!auth || !googleProvider) {
        throw new Error('Firebase not initialized');
    }
    return signInWithPopup(auth, googleProvider);
}

/**
 * Sign the current user out.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    if (!auth) return;
    return signOut(auth);
}
