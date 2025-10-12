// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This logic ensures that we don't try to re-initialize the app in hot-reload environments.
if (!admin.apps.length) {
  try {
    // This will attempt to initialize using Application Default Credentials
    // which works in many cloud environments (like Cloud Run) and locally
    // if the gcloud CLI is authenticated (gcloud auth application-default login).
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized successfully (automatic).");
  } catch (error: any) {
    console.error("CRITICAL: Automatic Firebase Admin SDK initialization failed.", error.message);
    // As a fallback for local development, you might use a service account file,
    // but automatic credentials should be preferred.
    // This error is critical because server-side functionality will not work.
  }
}

// Export a single, initialized instance of the Firestore database.
// All server-side code will import this `db` object to interact with Firestore.
const db = admin.firestore();

export { db };
