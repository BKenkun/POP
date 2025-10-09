'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

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
  try {
    return JSON.parse(serviceAccount);
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e);
    return undefined;
  }
}

let app: App;
let db: Firestore;

if (!getApps().length) {
  const serviceAccount = getServiceAccount();
  app = initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : { projectId: firebaseConfig.projectId }
  );
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { db };
