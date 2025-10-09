
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FILE
function getServiceAccount() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'FIREBASE_SERVICE_ACCOUNT env var is not set. The app will not work correctly. Please add it to your secrets.'
      );
    }
    return undefined;
  }
  return JSON.parse(serviceAccount);
}

export function initializeFirebase() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    initializeApp(
      serviceAccount
        ? { credential: cert(serviceAccount) }
        : { projectId: firebaseConfig.projectId }
    );
  }
  return getSdks(getApp());
}

export function getSdks(app: App) {
  return {
    db: getFirestore(app),
    auth: getAuth(app),
  };
}
