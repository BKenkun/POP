
'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from './config';
import { db as adminDb } from '@/lib/firebase'; // Import the admin instance with a different name

// IMPORTANT: DO NOT MODIFY THIS FILE

// This function is now simplified as initialization is handled in @/lib/firebase
export function initializeFirebase() {
  if (!getApps().length) {
    throw new Error("Firebase Admin SDK not initialized. This should be handled by the central @/lib/firebase module.");
  }
  return getSdks(getApp());
}

export function getSdks(app: App) {
  return {
    db: adminDb, // Use the imported admin db instance
    auth: getAuth(app),
  };
}
