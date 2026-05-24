import { cookies } from 'next/headers';
import { adminAuth } from '@/firebase/admin';

export async function assertAdmin(): Promise<void> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) throw new Error('No autenticado');
    const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (claims.email !== process.env.ADMIN_EMAIL) throw new Error('Sin permisos de administrador');
}