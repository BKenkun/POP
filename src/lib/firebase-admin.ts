import admin from 'firebase-admin';

/**
 * Server-only Firebase Admin SDK.
 *
 * In Google Cloud runtimes (Firebase App Hosting / Cloud Run), use Application
 * Default Credentials from the runtime service account. This avoids relying on
 * a manually stored service-account private key that may be invalid or revoked.
 *
 * For local development or hosting outside Google Cloud, FIREBASE_SERVICE_ACCOUNT_JSON
 * remains available as a fallback.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : undefined);

  // App Hosting runs on Cloud Run and provides K_SERVICE/K_REVISION.
  // Prefer the runtime identity there; do not override it with a manual key.
  const isGoogleCloudRuntime = Boolean(process.env.K_SERVICE || process.env.K_REVISION);

  if (isGoogleCloudRuntime) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      ...(projectId && { projectId }),
      storageBucket,
    });
    return;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const credentials = JSON.parse(json) as admin.ServiceAccount & {
      project_id?: string;
      projectId?: string;
    };
    const projectIdFromKey = credentials.project_id || credentials.projectId;
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      ...(projectIdFromKey && !projectId && { projectId: projectIdFromKey }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        (projectIdFromKey ? `${projectIdFromKey}.appspot.com` : undefined),
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...(projectId && { projectId }),
    storageBucket,
  });
}

initializeFirebaseAdmin();

export const firestore = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
