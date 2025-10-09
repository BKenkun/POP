
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/session'; // Import from the new session library

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// This is the session payload that will be stored in the cookie.
interface AdminSessionPayload {
  email: string;
  isAdmin: true;
  expires: Date;
}


// This function now returns an error message or nothing on success.
// Redirection is handled by the client to avoid race conditions.
export async function login(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get('email');
  const password = formData.get('password');

  // 1. Verify credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { error: 'Credenciales inválidas' };
  }

  // 2. Create the session
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const sessionPayload: AdminSessionPayload = { email: ADMIN_EMAIL!, isAdmin: true, expires };

  // 3. Encrypt the session using the new library
  const session = await encrypt(sessionPayload);

  // 4. Save the session in a cookie, making it available for all paths.
  // CRITICAL: The 'path: "/"' ensures the cookie is sent for all requests on the domain.
  cookies().set('admin_session', session, { expires, httpOnly: true, path: '/' });
  
  // 5. DO NOT redirect from the server action. The client will handle it.
}

export async function logout() {
  // Destroy the session
  cookies().set('admin_session', '', { expires: new Date(0), path: '/' });
  redirect('/verify');
}
