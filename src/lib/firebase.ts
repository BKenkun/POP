// Ubicación: src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// 1. EL OBJETO DE CONFIGURACIÓN
// Estas son las "coordenadas" de tu proyecto de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDF062S49yLIQxxKSR-YUoHagNFAAeAjg4",
  authDomain: "purorush.firebaseapp.com",
  projectId: "purorush",
  storageBucket: "purorush.appspot.com",
  messagingSenderId: "870980470663",
  appId: "1:870980470663:web:533824f7e6c462a8d0f522"
};

// 2. INICIALIZACIÓN IDEMPOTENTE Y SEGURA
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 3. OBTENCIÓN DE SERVICIOS
const auth = getAuth(app);
const db = getFirestore(app);

// 4. CONEXIÓN A EMULADORES (SOLO EN DESARROLLO)
// Esta lógica se ejecuta solo en el navegador y en modo de desarrollo.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log("Connecting to Firebase emulators...");
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        console.log("Successfully connected to Firebase emulators.");
    } catch (e) {
        console.warn("Could not connect to Firebase emulators. This is expected if they are not running.", e);
    }
}


// 5. EXPORTACIÓN
// Se exportan las instancias para ser usadas en otros lugares.
export { app, auth, db };
