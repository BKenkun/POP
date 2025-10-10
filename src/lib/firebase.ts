
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// IMPORTANT: DO NOT MODIFY THIS FILE

let app: App;
let db: Firestore;

// This logic ensures a single initialization of the Firebase Admin SDK.
if (!getApps().length) {
  // When running in a Google Cloud environment (like App Hosting),
  // initializeApp() with no arguments will automatically use Application
  // Default Credentials (ADC). This is the most robust authentication method.
  app = initializeApp();
} else {
  // If already initialized, get the existing app.
  app = getApps()[0];
}

// Get the Firestore instance from the initialized app.
db = getFirestore(app);

// Export the singleton instance directly for use in server-side code.
export { db };

// Kept for compatibility if other parts of the codebase were to use it, but db is preferred.
export const getAdminDb = () => db;
