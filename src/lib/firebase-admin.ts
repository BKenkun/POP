// This file configures the Firebase Admin SDK.
// It is used for server-side operations that require admin privileges.

import admin from 'firebase-admin';

// Re-construct the service account from environment variables
// This is necessary because multiline strings are not well-supported in some envs.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  } else if (process.env.NODE_ENV !== 'development') {
    // In production (like on Firebase App Hosting), initializeApp() automatically
    // uses the environment's service account credentials.
    admin.initializeApp();
  } else {
    // In local development, if the service account isn't set, we can't initialize.
    console.warn("Firebase Admin SDK not initialized. `FIREBASE_SERVICE_ACCOUNT_JSON` env var is missing.");
  }
}

export const firestore = admin.firestore();
export const adminAuth = admin.auth();
