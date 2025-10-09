'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  cookies().set('session', '', { expires: new Date(0), path: '/' });
  redirect('/login');
}
