// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This logic ensures that we don't try to re-initialize the app in hot-reload environments.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('La variable de entorno SERVICE_ACCOUNT no está configurada.');
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
     console.log("Firebase Admin SDK inicializado con éxito usando la cuenta de servicio.");
  } catch (error) {
    console.error("Error al inicializar Firebase Admin SDK:", error);
    // En un entorno de producción, es posible que desees manejar esto de manera diferente,
    // pero para el desarrollo, mostrar el error es crucial.
    // Si la inicialización automática falla, podría ser porque las credenciales no están donde se esperan.
     if (process.env.NODE_ENV !== 'production') {
        console.warn("Intentando inicialización automática por defecto como fallback...");
        try {
          admin.initializeApp();
          console.log("Inicialización automática por defecto exitosa como fallback.");
        } catch (fallbackError) {
          console.error("La inicialización automática por defecto también falló:", fallbackError);
        }
    }
  }
}


// Export a single, initialized instance of the Firestore database.
// All server-side code will import this `db` object to interact with Firestore.
const db = admin.firestore();

export { db };
