
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Evitar la reinicialización en entornos de desarrollo con hot-reloading
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('The SERVICE_ACCOUNT environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    // No lanzar un error aquí para permitir que la aplicación intente iniciarse,
    // pero los fallos ocurrirán en las llamadas a la base de datos.
  }
}

// Exporta una instancia de la base de datos que ya tiene permisos de administrador.
const db = getFirestore();

export { db };
