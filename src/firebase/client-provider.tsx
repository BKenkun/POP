'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore } from '@/firebase'; // Import directly

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * This Client Component wraps its children with the FirebaseProvider,
 * passing down the initialized Firebase services.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {

  // The services are now initialized just once in `src/firebase/index.ts`.
  // We simply pass them to the provider.
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
