import admin from 'firebase-admin';

/**
 * Server-only Firebase Admin SDK.
 *
 * Firebase App Hosting injects the Firebase configuration and provides
 * Application Default Credentials for its runtime service account. Use the
 * platform's default initialization there so the SDK obtains both its project
 * configuration and credentials from the supported App Hosting integration.
 *
 * Outside Google Cloud, FIREBASE_SERVICE_ACCOUNT_JSON remains available as a
 * fallback for local development or other hosting providers.
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }

  // App Hosting / Cloud Run supplies ADC and FIREBASE_CONFIG. The official
  // no-argument initialization avoids overriding the platform's configuration
  // with a potentially stale project ID or storage bucket from env variables.
  const isGoogleCloudRuntime = Boolean(process.env.K_SERVICE || process.env.K_REVISION);

  if (isGoogleCloudRuntime) {
    admin.initializeApp();
    return;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.appspot.com` : undefined);

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
