
import admin from 'firebase-admin';

// This configuration uses the service account details you provided,
// ensuring the server-side Admin SDK can always authenticate correctly.
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "purorush",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@purorush.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function getFirebaseAdmin() {
    if (!admin.apps.length) {
      try {
        // We only initialize with a credential if the private key is available.
        // In Firebase App Hosting, it initializes automatically without needing the key.
        if (serviceAccount.privateKey) {
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              storageBucket: "purorush.appspot.com"
            });
            console.log("Firebase Admin SDK initialized with service account.");
        } else {
            // Initialize without explicit credentials, relying on the hosting environment
            admin.initializeApp({
                storageBucket: "purorush.appspot.com"
            });
            console.log("Firebase Admin SDK initialized via Application Default Credentials.");
        }
      } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.stack);
      }
    }
    return {
        firestore: admin.firestore(),
        auth: admin.auth(),
        storage: admin.storage()
    }
}

export const { firestore, auth, storage } = getFirebaseAdmin();
