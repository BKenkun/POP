
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: App;

if (!getApps().length) {
    try {
        // Try to initialize with service account credentials from environment variables (for production)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: firebaseConfig.projectId,
        });
    } catch (e) {
        console.warn("Could not initialize Firebase Admin with service account. Falling back to default credentials (useful for local development).", e);
        // Fallback for local development or environments where GOOGLE_APPLICATION_CREDENTIALS is set
        app = initializeApp({
            projectId: firebaseConfig.projectId,
        });
    }
} else {
    app = getApps()[0];
}

export const db = getFirestore(app);
