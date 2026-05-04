'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// --- Configuración de Conexión a Hilow ---
const hilowFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_HILOW_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_HILOW_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_HILOW_FIREBASE_PROJECT_ID!,
};

// --- Inicialización de Firebase (con nombre para evitar conflictos) ---
const HILOW_APP_NAME = "hilow-checkout";

let app: FirebaseApp;
let db: Firestore;

if (!getApps().some(app => app.name === HILOW_APP_NAME)) {
  app = initializeApp(hilowFirebaseConfig, HILOW_APP_NAME);
} else {
  app = getApp(HILOW_APP_NAME);
}

db = getFirestore(app);

// Exportar la instancia de la base de datos de Hilow
export { db as hilowDb };
