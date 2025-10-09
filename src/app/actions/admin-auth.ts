
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { redirect } from 'next/navigation';

const secretKey = process.env.JWT_SECRET_KEY || 'super-secret-key-for-jwt-that-is-long-enough';
const key = new TextEncoder().encode(secretKey);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// This is the session payload that will be stored in the cookie.
interface AdminSessionPayload {
  email: string;
  isAdmin: true;
  expires: Date;
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session expires in 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as AdminSessionPayload;
  } catch (error) {
    // This will happen if the token is expired or invalid
    console.log('Failed to verify token');
    return null;
  }
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

  // 3. Encrypt the session
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

export async function getAdminSession() {
  const session = cookies().get('admin_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}
