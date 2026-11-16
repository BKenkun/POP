'use client';

import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { trackKlaviyoEvent } from '@/app/actions/klaviyo';

export interface GoogleSignInResult {
  user: User;
  isNewUser: boolean;
}

/**
 * Authenticates the user with Google via Firebase popup, creates the server
 * session cookie, and initializes the Firestore user profile on first sign-in
 * without overwriting existing loyalty points or addresses.
 */
export async function authenticateWithGoogle(): Promise<GoogleSignInResult> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  const signedInUser = credential.user;

  const idToken = await signedInUser.getIdToken();

  // Create server-side httpOnly session cookie (non-fatal if offline/fallback)
  try {
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch (sessionErr) {
    console.warn('Notice creating session cookie after Google login:', sessionErr);
  }

  // Ensure Firestore user document exists without touching existing profile fields
  let isNewUser = false;
  try {
    const userDocRef = doc(db, 'users', signedInUser.uid);
    const existingSnap = await getDoc(userDocRef);

    if (!existingSnap.exists()) {
      isNewUser = true;
      const displayName =
        signedInUser.displayName ||
        signedInUser.email?.split('@')[0] ||
        'Customer';

      await setDoc(userDocRef, {
        email: signedInUser.email || '',
        uid: signedInUser.uid,
        creationTime: serverTimestamp(),
        displayName,
        loyaltyPoints: 0,
        isSubscribed: false,
        addresses: [],
      });

      if (signedInUser.email) {
        trackKlaviyoEvent('Admin New User Notification', 'maryandpopper@gmail.com', {
          NewUserEmail: signedInUser.email,
          NewUserName: displayName,
          RegistrationDate: new Date().toISOString(),
        }).catch(() => {});
      }
    }
  } catch (profileErr) {
    console.warn('Notice checking/creating user profile after Google login:', profileErr);
  }

  return { user: signedInUser, isNewUser };
}

export function getGoogleAuthErrorMessage(err: unknown): string | null {
  const code = (err as { code?: string })?.code || '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return null; // User intentionally closed the popup; no destructive error needed
  }
  if (code === 'auth/popup-blocked') {
    return 'El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'El acceso con Google aún no está habilitado en Firebase Authentication.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Este dominio aún no está autorizado en Firebase Authentication (Settings → Authorized domains).';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'Ya existe una cuenta con este correo usando otro método de acceso.';
  }

  return 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.';
}
