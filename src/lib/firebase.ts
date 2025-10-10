
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FILE

let app: App;
let db: Firestore;

// This logic ensures a single initialization of the Firebase Admin SDK.
if (!getApps().length) {
    try {
        // When running in a Google Cloud environment (like App Hosting),
        // the service account credentials can be automatically discovered.
        app = initializeApp();
    } catch (e) {
        console.warn("Automatic Firebase Admin SDK initialization failed, falling back to local config. This is expected in local development.", e);
        // Fallback for local development or environments without ADC.
        // The service account JSON must be set as an environment variable.
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : undefined;

        if (serviceAccount) {
            app = initializeApp({
                credential: cert(serviceAccount),
                databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            });
        } else if (process.env.NODE_ENV !== 'production') {
            // In a non-production environment, if no service account is found,
            // we can initialize without it for some functionalities, though Firestore might fail.
            app = initializeApp({ projectId: firebaseConfig.projectId });
        } else {
            // In production, a service account is required if ADC fails.
            throw new Error('Firebase Admin SDK initialization failed. Service account credentials are not available.');
        }
    }
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
