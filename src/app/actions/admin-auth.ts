'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt, decrypt } from '@/lib/session';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized on the server
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    try {
        const auth = getAuth();
        // This authenticates against Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // This sets the regular user session cookie
        const idToken = await userCredential.user.getIdToken();
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        cookies().set('session', idToken, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // If the authenticated user is the admin, create the separate admin session
        if (email === adminEmail) {
            const adminExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for admin
            const adminSession = await encrypt({ user: { email: adminEmail, isAdmin: true }, expires: adminExpires });
            cookies().set('admin_session', adminSession, { expires: adminExpires, httpOnly: true, path: '/' });
            return { success: true, redirectPath: '/admin' };
        }

        return { success: true, redirectPath: '/account' };

    } catch (error: any) {
        console.error("Login action error:", error);
        let errorMessage = 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.';
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            // Keep error message generic for security
        } else {
            errorMessage = 'Ocurrió un error inesperado durante el inicio de sesión.';
        }
        return { error: errorMessage };
    }
}

export async function logout() {
  // Clear both cookies
  cookies().set('session', '', { expires: new Date(0), path: '/' });
  cookies().set('admin_session', '', { expires: new Date(0), path: '/' });
  redirect('/login');
}

export async function getAdminSession() {
    const sessionCookie = cookies().get('admin_session')?.value;
    if (!sessionCookie) return null;
    try {
        return await decrypt(sessionCookie);
    } catch (error) {
        console.error("Failed to decrypt session cookie:", error);
        return null;
    }
}
