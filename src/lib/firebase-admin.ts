import 'server-only';
// Modificado por: Webmaster Freddy Poleo
import admin from 'firebase-admin';

/**
 * Firebase Admin initialization for Firebase App Hosting / Cloud Run.
 * Uses the runtime service account (Application Default Credentials) in Google Cloud.
 * A Secret Manager-backed service-account JSON value is retained only as a local
 * development/alternate-hosting fallback. Never add private key material to source.
 */
function initializeFirebaseAdmin(): void {
  if (admin.apps.length > 0) return;

  const isGoogleCloudRuntime = Boolean(process.env.K_SERVICE || process.env.K_REVISION);
  if (isGoogleCloudRuntime) {
    admin.initializeApp();
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (projectId ? projectId + '.appspot.com' : undefined);

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const credentials = JSON.parse(serviceAccountJson) as admin.ServiceAccount & {
      project_id?: string;
      projectId?: string;
    };
    const keyProjectId = credentials.project_id || credentials.projectId;

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      ...(keyProjectId && !projectId ? { projectId: keyProjectId } : {}),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        (keyProjectId ? keyProjectId + '.appspot.com' : undefined),
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...(projectId ? { projectId } : {}),
    ...(storageBucket ? { storageBucket } : {}),
  });
}

initializeFirebaseAdmin();

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
