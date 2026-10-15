'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithGoogle as firebaseSignIn, logoutUser } from '@/lib/firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Isolated local preview mode for headless visual verification
    if (typeof window !== 'undefined' && localStorage.getItem('vritta-preview-auth') === 'true') {
      queueMicrotask(() => {
        setUser({
          uid: 'preview-manish',
          email: 'manishborikar92@gmail.com',
          displayName: 'Manish Borikar',
        });
        setLoading(false);
      });
      return;
    }

    if (!auth) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebaseSignIn();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
