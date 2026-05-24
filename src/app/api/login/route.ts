
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/firebase/admin';
import { loginRatelimit } from '@/lib/rate-limit';

// Duration of the session cookie in milliseconds. 5 days.
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { success } = await loginRatelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ status: 'error', message: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 });
  }

  const { idToken } = await request.json();
 
  try {
    const auth = adminAuth();
 
    const decodedToken = await auth.verifyIdToken(idToken);

    let tokenForCookie = idToken;
 
    if (decodedToken.email === process.env.ADMIN_EMAIL && !decodedToken.admin) {
      await auth.setCustomUserClaims(decodedToken.uid, { admin: true });
      return NextResponse.json({ status: 'refresh_required' });
    }
    
    const sessionCookie = await auth.createSessionCookie(tokenForCookie, { expiresIn });
 
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    };
 
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set(options);
 
    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json(
      { status: 'error', message: 'Could not create session.' },
      { status: 401 }
    );
  }
}