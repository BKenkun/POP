
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// IMPORTANT: DO NOT MODIFY THIS FILE

let app: App;
let db: Firestore;

// This logic ensures a single initialization of the Firebase Admin SDK.
if (!getApps().length) {
  // When deployed to App Hosting, FIREBASE_CONFIG is automatically set.
  // We parse this to get the project ID and use the default credential.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : undefined;

  app = initializeApp({
    credential: cert(serviceAccount),
    // The databaseURL is crucial for the Admin SDK to know which database to connect to.
    databaseURL: `https://${process.env.GCLOUD_PROJECT || process.env.PROJECT_ID}.firebaseio.com`,
  });

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
