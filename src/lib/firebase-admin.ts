import admin from 'firebase-admin';

/**
 * Server-only Firebase Admin SDK.
 *
 * Credentials (choose one):
 * - FIREBASE_SERVICE_ACCOUNT_JSON: full JSON of the service account (recommended for Vercel/hosting).
 * - GOOGLE_APPLICATION_CREDENTIALS: path to the JSON file (local dev / GCP); uses application default credentials.
 *
 * If credentials were ever committed to git, rotate the key in Google Cloud Console.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const raw = JSON.parse(json) as admin.ServiceAccount & { project_id?: string };
    const credentials = raw as admin.ServiceAccount;
    const projectIdFromKey = raw.project_id || raw.projectId;
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        (projectIdFromKey ? `${projectIdFromKey}.appspot.com` : undefined),
    });
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...(projectId && { projectId }),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      (projectId ? `${projectId}.appspot.com` : undefined),
  });
}

initializeFirebaseAdmin();

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
