
'use client';

import { useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

/**
 * Custom hook to get the current authenticated user from Firebase.
 * @param auth - The Firebase Auth instance.
 * @returns An object containing the user, loading state, and any error.
 */
export function useUser(auth: Auth) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up the listener for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsUserLoading(false);
      },
      (error) => {
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [auth]);

  return { user, isUserLoading, userError };
}
