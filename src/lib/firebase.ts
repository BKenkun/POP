
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FILE

function getServiceAccount() {
  // This function is now deprecated for App Hosting, but kept for legacy or alternative environments.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    return undefined;
  }
  try {
    return JSON.parse(serviceAccount);
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e);
    return undefined;
  }
}

let app: App;
let db: Firestore;

if (!getApps().length) {
    // App Hosting provides service account credentials via environment variables.
    // initializeApp() will automatically use them when no credential is provided.
    app = initializeApp();
} else {
  app = getApps()[0];
}

db = getFirestore(app);

// Export the singleton instance directly
export { db };

// Kept for compatibility if other parts of the codebase were to use it, but db is preferred.
export const getAdminDb = () => db;
