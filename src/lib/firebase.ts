import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

// Busca explícitamente la instancia '[DEFAULT]' para no chocar con apps secundarias con nombre (ej. 'hilow-checkout')
const existingDefaultApp = getApps().find((existing) => existing.name === '[DEFAULT]');
const app: FirebaseApp = existingDefaultApp ?? initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

function initSafeFirestore(firebaseApp: FirebaseApp): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

const db: Firestore = initSafeFirestore(app);

export { app, auth, db };
