import admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;

console.log('API KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('PROJECT ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

export function getFirebaseAdminApp() {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.app();
    return firebaseAdminApp;
  }

  try {
    const serviceAccountJson =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    // PRODUCCIÓN
    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);

      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: credentials.project_id,
          clientEmail: credentials.client_email,
          privateKey: credentials.private_key.replace(/\\n/g, "\n"),
        }),
        storageBucket:
          process.env.FIREBASE_STORAGE_BUCKET ||
          `${credentials.project_id}.appspot.com`,
      });

      return firebaseAdminApp;
    }

    // DESARROLLO LOCAL
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      throw new Error(
        "Missing FIREBASE_PROJECT_ID environment variable"
      );
    }

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${projectId}.appspot.com`,
    });

    return firebaseAdminApp;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);

    throw error;
  }
}

export const firestore = () =>
  admin.firestore(getFirebaseAdminApp());

export const adminAuth = () =>
  admin.auth(getFirebaseAdminApp());

export const adminStorage = () =>
  admin.storage(getFirebaseAdminApp());

export default admin;