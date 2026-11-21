'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';

const hilowFirebaseConfig = {
  projectId: 'studio-953389996-b1a64',
  appId: '1:272897992610:web:b39d784458a79edf2274fb',
  apiKey: 'AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8',
  authDomain: 'studio-953389996-b1a64.firebaseapp.com',
};

const HILOW_APP_NAME = 'hilow-checkout';

const existingHilowApp = getApps().find((existing) => existing.name === HILOW_APP_NAME);
const app: FirebaseApp = existingHilowApp ?? initializeApp(hilowFirebaseConfig, HILOW_APP_NAME);

let hilowDb: Firestore;
try {
  hilowDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: memoryLocalCache(),
  });
} catch {
  hilowDb = getFirestore(app);
}

export { hilowDb };
