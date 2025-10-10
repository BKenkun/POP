import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: App;
let db: Firestore;

if (!getApps().length) {
  try {
    // This is the recommended way for App Hosting and other Google Cloud environments.
    // It automatically uses Application Default Credentials.
    app = initializeApp();
  } catch (e) {
    console.warn("Could not initialize via Application Default Credentials, falling back to local config. Error:", e);
    // Fallback for local development if ADC isn't set up.
    // Requires FIREBASE_SERVICE_ACCOUNT to be in the .env file.
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
             // If no service account, attempt a basic initialization which might have limited permissions.
            console.warn("FIREBASE_SERVICE_ACCOUNT env var not set. Attempting basic initialization.");
            app = initializeApp({ projectId: firebaseConfig.projectId });
        }
    } catch (finalError) {
        console.error("CRITICAL: Firebase Admin SDK initialization failed completely.", finalError);
        // Create a dummy app to avoid crashing the server on db access, though it will fail.
        if (!getApps().length) {
          app = initializeApp();
        } else {
          app = getApps()[0];
        }
    }
  }
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { db };
