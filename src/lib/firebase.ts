
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FILE

let app: App;
let db: Firestore;

// This logic ensures a single initialization of the Firebase Admin SDK.
if (!getApps().length) {
    // When running in a Google Cloud environment (like App Hosting),
    // the service account credentials can be automatically discovered.
    // However, to ensure robust initialization in all environments,
    // we explicitly use the service account if available.
    try {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : undefined;

        if (serviceAccount) {
            app = initializeApp({
                credential: cert(serviceAccount),
                databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            });
        } else {
            // Fallback for environments where ADC is expected to work but service account variable is not set
            app = initializeApp();
        }
    } catch (e) {
        console.error("Firebase Admin SDK initialization failed.", e);
        // If all else fails, try a basic initialization. This might have limited permissions.
        if (!getApps().length) {
            app = initializeApp({ projectId: firebaseConfig.projectId });
        } else {
            app = getApps()[0];
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
