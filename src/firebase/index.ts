
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    // For local development, always initialize with the config object.
    // For production on App Hosting, environment variables will be available.
    if (process.env.NODE_ENV === 'development') {
        firebaseApp = initializeApp(firebaseConfig);
    } else {
        try {
            // App Hosting provides config via environment variables.
            firebaseApp = initializeApp();
        } catch (e) {
            console.warn('Automatic Firebase initialization failed. Falling back to firebaseConfig object.', e);
            // Fallback for other environments or if auto-init fails.
            firebaseApp = initializeApp(firebaseConfig);
        }
    }

    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    // Development only: Connect to emulators
    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
        console.log("Firebase emulators connected.");
      } catch (e) {
        console.warn("Could not connect to Firebase emulators. This is expected if they are not running.", e);
      }
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
