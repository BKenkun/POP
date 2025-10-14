// This file configures the Firebase Admin SDK.
// It is used for server-side operations that require admin privileges.

import admin from 'firebase-admin';

// Re-construct the service account from environment variables
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let serviceAccount: admin.ServiceAccount | undefined;

if (serviceAccountString) {
  try {
    const parsedServiceAccount = JSON.parse(serviceAccountString);
    // Vercel and other platforms often replace newlines with \\n. We need to fix this.
    parsedServiceAccount.***REMOVED*** = parsedServiceAccount.***REMOVED***.replace(/\\n/g, '\n');
    serviceAccount = parsedServiceAccount;
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', e);
  }
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      });
    } else {
      // In production (like on Firebase App Hosting), initializeApp() automatically
      // uses the environment's service account credentials if the env var isn't set.
      admin.initializeApp();
    }
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
  }
}

// Export getters to ensure initialization has run before accessing services.
export const firestore = admin.firestore();
export const adminAuth = admin.auth();
