'use client';

// This file is now primarily for re-exporting the modules for easy access.
// The core initialization logic has been moved to `client-provider.tsx`.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';

// Legacy exports kept for compatibility, but client-provider is the source of truth
export { auth, firestore, firebaseApp } from './client-provider';

// This function is deprecated and no longer necessary.
// Kept for compatibility to avoid breaking imports.
export function initializeFirebase() {
    const { auth, firestore, firebaseApp } = require('./client-provider');
    return { firebaseApp, auth, firestore };
}
