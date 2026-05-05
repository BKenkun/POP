import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccount) {
    const credentials = JSON.parse(serviceAccount);

    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${credentials.project_id}.appspot.com`,
    });
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const app = initializeFirebaseAdmin();

export const firestore = admin.firestore(app);
export const adminAuth = admin.auth(app);
export const adminStorage = admin.storage(app);

export default admin;