
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// This ensures there's only one Firebase Admin instance.
let app: App;

if (!getApps().length) {
    try {
        // This is the recommended way for App Hosting and other Google Cloud environments.
        // It automatically uses Application Default Credentials if available.
        console.log("Attempting to initialize Firebase Admin with Application Default Credentials...");
        app = initializeApp();
        console.log("Firebase Admin initialized successfully using ADC.");
    } catch (e) {
        console.warn("Could not initialize with ADC, falling back to service account from env var. Error:", e);
        try {
            // Fallback for local development or environments where ADC isn't set up.
            // Requires FIREBASE_SERVICE_ACCOUNT to be in the .env file.
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!serviceAccountString) {
                throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
            }
            const serviceAccount = JSON.parse(serviceAccountString);

            app = initializeApp({
                credential: cert(serviceAccount),
                databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            });
            console.log("Firebase Admin initialized successfully using service account from env var.");
        } catch (finalError) {
            console.error("CRITICAL: Firebase Admin SDK initialization failed completely.", finalError);
            // This will likely cause server-side operations to fail, but prevents a hard crash on import.
            // A dummy app is created to avoid crashes on access, but operations will fail.
             if (!getApps().length) {
               app = initializeApp();
            } else {
               app = getApps()[0];
            }
        }
    }
} else {
    app = getApps()[0];
    console.log("Using existing Firebase Admin app instance.");
}

const db: Firestore = getFirestore(app);

export { db };
