'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// --- Configuración de Conexión a Hilow ---
const hilowFirebaseConfig = {
  projectId: "studio-953389996-b1a64",
  appId: "1:272897992610:web:b39d784458a79edf2274fb",
  apiKey: "AIzaSyA27KSQo4tgrVNMurwrYO_B59-1njW3Qz8",
  authDomain: "studio-953389996-b1a64.firebaseapp.com",
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
