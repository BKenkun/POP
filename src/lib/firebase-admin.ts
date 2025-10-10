// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This logic ensures that we don't try to re-initialize the app in hot-reload environments.
if (!admin.apps.length) {
  // When deployed to Firebase App Hosting or other Google Cloud environments,
  // initializeApp() automatically discovers the service account credentials.
  // This is the standard and most robust way to initialize.
  admin.initializeApp();
}

// Export a single, initialized instance of the Firestore database.
// All server-side code will import this `db` object to interact with Firestore.
const db = admin.firestore();

export { db };
