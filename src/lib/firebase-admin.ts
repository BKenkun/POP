// This file configures the Firebase Admin SDK.
// It is used for server-side operations that require admin privileges.

import admin from 'firebase-admin';

// Re-construct the service account from environment variables
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!admin.apps.length) {
  try {
    // In a development environment like Studio, we MUST use explicit credentials.
    // In a production environment (App Hosting), initializeApp() can be called without arguments.
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      // Vercel and other platforms often replace newlines with \\n. We need to fix this.
      if (serviceAccount.***REMOVED***) {
        serviceAccount.***REMOVED*** = serviceAccount.***REMOVED***.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // This will work in production on App Hosting
      admin.initializeApp();
    }
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
  }
}

// Export getters to ensure initialization has run before accessing services.
export const firestore = admin.firestore();
export const adminAuth = admin.auth();
