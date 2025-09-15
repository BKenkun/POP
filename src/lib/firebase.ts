// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "purorush",
  "appId": "1:870980470663:web:533824f7e6c462a8d0f522",
  "storageBucket": "purorush.firebasestorage.app",
  "apiKey": "AIzaSyDF062S49yLIQxxKSR-YUoHagNFAAeAjg4",
  "authDomain": "purorush.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "870980470663"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
