
// Ubicación: src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config"; // Import config from a separate file

// --- This is the corrected, simplified, and robust initialization ---

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This logic now correctly handles both development and production environments.
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// EXPORTACIÓN
// Se exportan las instancias para ser usadas en otros lugares.
export { app, auth, db };
