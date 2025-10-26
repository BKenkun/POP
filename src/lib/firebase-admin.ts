
import admin from 'firebase-admin';

// This configuration uses the service account details you provided,
// ensuring the server-side Admin SDK can always authenticate correctly.
const serviceAccount = {
  projectId: "purorush",
  clientEmail: "firebase-adminsdk-fbsvc@purorush.iam.gserviceaccount.com",
  // IMPORTANT: The private key should ideally be stored in an environment variable.
  // For this context, we are using the value directly, ensuring it's parsed correctly.
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

function getFirebaseAdmin() {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: "purorush.appspot.com"
        });
        console.log("Firebase Admin SDK initialized with explicit credentials.");
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
