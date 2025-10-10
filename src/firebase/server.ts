
'use server';

import { getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase'; // Import the already initialized admin instance

// IMPORTANT: DO NOT MODIFY THIS FILE

export function initializeFirebase() {
  if (!getApps().length) {
    throw new Error("Firebase Admin SDK not initialized. This should be handled by the central @/lib/firebase module.");
  }
  // The app is already initialized in @/lib/firebase.ts, so we just get the existing instance.
  return getSdks(getApps()[0]);
}

export function getSdks(app: App) {
  return {
    db: db, // Use the imported admin db instance
    auth: getAuth(app),
  };
}
