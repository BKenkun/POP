'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // IMPORTANT: Read from process.env directly inside the function
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
        // Create the session
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        const session = await encrypt({ user: { email: adminEmail, isAdmin: true }, expires });

        // Save the session in a cookie
        cookies().set('admin_session', session, { expires, httpOnly: true });
        redirect('/admin');
    } else {
        // Use a query param to show an error on the page
        redirect('/verify?error=invalid_credentials');
    }
}

export async function logout() {
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
