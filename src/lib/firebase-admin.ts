
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This logic ensures that we don't try to re-initialize the app in hot-reload environments.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.SERVICE_ACCOUNT;
    
    if (!serviceAccountString) {
      throw new Error('La variable de entorno SERVICE_ACCOUNT es requerida y no fue encontrada.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
     console.log("Firebase Admin SDK inicializado correctamente.");
     
  } catch (error: any) {
    console.error("CRITICAL: Error al inicializar Firebase Admin SDK. El panel de administrador no funcionará.", error.message);
    // In a production environment, you might want to handle this more gracefully,
    // but throwing the error makes it obvious during development that something is wrong.
    throw new Error("La configuración del servidor de Firebase es inválida. Revisa las variables de entorno.");
  }
}

// Export a single, initialized instance of the Firestore database.
// All server-side code will import this `db` object to interact with Firestore.
const db = admin.firestore();

export { db };
