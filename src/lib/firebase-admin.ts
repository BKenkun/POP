// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// El email de la cuenta de servicio que ejecuta el backend en App Hosting.
const serviceAccountEmail = 'firebase-app-hosting-compute@purorush.iam.gserviceaccount.com';

if (!getApps().length) {
  try {
    console.log("Initializing Firebase Admin SDK...");
    admin.initializeApp({
      // Usamos la cuenta de servicio específica de App Hosting.
      // En producción, se autenticará automáticamente con los permisos que le has asignado.
      // En desarrollo local, si está configurado, usará las credenciales del entorno.
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://purorush.firebaseio.com`,
      // Especificamos la identidad que debe usar para las reglas de la base de datos
      databaseAuthVariableOverride: {
        uid: serviceAccountEmail
      }
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
