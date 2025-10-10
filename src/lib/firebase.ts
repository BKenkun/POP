
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FILE

let app: App;
let db: Firestore;

if (!getApps().length) {
  // This robust initialization ensures the Admin SDK is always properly authenticated.
  // In production on App Hosting, process.env.GOOGLE_APPLICATION_CREDENTIALS is automatically set.
  // In local development, it falls back to the service account key if provided.
  app = initializeApp({
    credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : {}),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });
} else {
  app = getApps()[0];
}

db = getFirestore(app);

// Export the singleton instance directly
export { db };

// Kept for compatibility if other parts of the codebase were to use it, but db is preferred.
export const getAdminDb = () => db;
