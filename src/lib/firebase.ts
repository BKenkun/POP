import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

// Busca explícitamente la instancia '[DEFAULT]' para no chocar con apps secundarias con nombre (ej. 'hilow-checkout')
const existingDefaultApp = getApps().find((existing) => existing.name === '[DEFAULT]');
const app: FirebaseApp = existingDefaultApp ?? initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
