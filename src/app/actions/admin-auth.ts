'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt, decrypt } from '@/lib/session';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

interface AdminSessionPayload {
  email: string;
  isAdmin: true;
  expires: Date;
}

export async function getAdminSession() {
  const cookie = cookies().get('admin_session')?.value;
  if (!cookie) return null;
  return await decrypt(cookie);
}


export async function login(formData: FormData): Promise<{ error: string } | void> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { error: 'Credenciales inválidas' };
  }

  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const sessionPayload: AdminSessionPayload = { email: ADMIN_EMAIL!, isAdmin: true, expires };

  const session = await encrypt(sessionPayload);

  cookies().set('admin_session', session, { expires, httpOnly: true, path: '/' });

  // Redirect to the admin dashboard upon successful login
  redirect('/admin');
}

export async function logout() {
  cookies().set('admin_session', '', { expires: new Date(0), path: '/' });
  redirect('/verify');
}
