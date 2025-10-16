
import admin from 'firebase-admin';

// Re-enable server-side admin capabilities.
// This is safe because it's only used by server actions, not during the page build process.

// Ensure that the service account details are set in the environment variables.
// In Firebase App Hosting, these are set automatically.
const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

function getFirebaseAdmin() {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
      } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.stack);
      }
    }
    return {
        firestore: admin.firestore(),
        auth: admin.auth(),
    }
}

export const { firestore, auth } = getFirebaseAdmin();
