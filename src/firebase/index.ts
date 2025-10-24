'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// --- This is the corrected, simplified, and robust initialization ---

let firebaseApp: FirebaseApp;

// This logic now correctly handles both development and production environments.
if (getApps().length === 0) {
    // If no app is initialized, initialize one with the provided config.
    // This is safe for both dev and prod. In production, Firebase Hosting
    // may provide configuration, but using the explicit config is also correct.
    firebaseApp = initializeApp(firebaseConfig);
} else {
    // If an app is already initialized, use it.
    // This prevents re-initialization errors in development with hot-reloading.
    firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

if (process.env.NODE_ENV === 'development') {
    // This check prevents connection attempts in production.
    // It is safe to be in client-side code.
    try {
        const { connectAuthEmulator } = require('firebase/auth');
        const { connectFirestoreEmulator } = require('firebase/firestore');
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
        console.log("Firebase emulators connected.");
    } catch (e) {
        console.warn("Could not connect to Firebase emulators. This is expected if they are not running.", e);
    }
}

export function initializeFirebase() {
    // This function now just returns the already initialized services.
    return { firebaseApp, auth, firestore };
}

// --- End of corrected initialization ---

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
