// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Evitar la reinicialización en entornos de desarrollo con hot-reloading
if (!admin.apps.length) {
  try {
    // Cuando se despliega en Firebase/Google Cloud, el SDK busca automáticamente las credenciales.
    // No es necesario pasarle un serviceAccount.
    admin.initializeApp();
  } catch (error: any) {
    // Este catch es por si las credenciales automáticas no se encuentran,
    // lo cual puede pasar en un entorno de desarrollo local no configurado.
    console.error('Firebase admin initialization error:', error.stack);
    throw new Error('Could not initialize Firebase Admin SDK. Make sure you have the necessary service account credentials set up in your environment.');
  }
}

// Exporta una instancia de la base de datos que ya tiene permisos de administrador.
const db = getFirestore();

export { db };
