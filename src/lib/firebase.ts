
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

try {
  if (getApps().length) {
    db = getFirestore(getApps()[0]);
  } else {
    // In a server environment like App Hosting, initializeApp() with no arguments
    // should automatically find the project's service account credentials.
    const app = initializeApp();
    db = getFirestore(app);
  }
} catch (error) {
  console.error("CRITICAL: Firebase Admin SDK initialization failed.", error);
  // If initialization fails, we create a dummy db object to prevent crashes on import,
  // though any server-side database operation will fail.
  // This is a fallback to keep the app from crashing entirely if credentials are not found.
  if (!getApps().length) {
    const app = initializeApp({
      // Dummy credential to allow initialization
      credential: cert({
        projectId: process.env.GCP_PROJECT || 'unknown',
        clientEmail: 'dummy@example.com',
        privateKey: '-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n'
      })
    });
     db = getFirestore(app);
  } else {
     db = getFirestore(getApps()[0]);
  }
}

export { db };
