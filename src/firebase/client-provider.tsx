'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from './config';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// --- Definitive Client-Side Initialization ---
// This is the single source of truth for Firebase initialization on the client.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

if (process.env.NODE_ENV === 'development') {
    // This check prevents connection attempts in production.
    try {
        const { connectAuthEmulator } = require('firebase/auth');
        const { connectFirestoreEmulator } = require('firebase/firestore');
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
        console.log("Firebase emulators connected via FirebaseClientProvider.");
    } catch (e) {
        console.warn("Could not connect to Firebase emulators. This is expected if they are not running.");
    }
}
// ----------------------------------------------


/**
 * This Client Component wraps its children with the FirebaseProvider,
 * passing down the correctly initialized Firebase services.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {

  // The services are now initialized just once above.
  // We simply pass them to the provider.
  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
