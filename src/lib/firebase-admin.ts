
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: App;

if (!getApps().length) {
    try {
        // En producción, FIREBASE_CONFIG es una variable de entorno proporcionada por Firebase Hosting.
        // El SDK de Admin la usará automáticamente si existe.
        app = initializeApp();
    } catch (e) {
        console.warn("Inicialización automática fallida. Intentando con credenciales de servicio (entorno local)...", e);
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: firebaseConfig.projectId,
            });
        } catch (e2) {
             console.error("FALLO CRÍTICO: No se pudo inicializar Firebase Admin SDK ni de forma automática ni con credenciales de servicio.", e2);
             // En un entorno real, esto debería detener la aplicación o alertar a los desarrolladores.
        }
    }
} else {
    app = getApps()[0];
}

// @ts-ignore
export const db = getFirestore(app);
