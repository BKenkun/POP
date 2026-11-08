// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

// Five-day session; Firebase recommends a short re-authentication window when exchanging ID tokens.
const expiresIn = 60 * 60 * 24 * 5 * 1000;
const recentAuthWindowSeconds = 5 * 60;

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;

  try {
    const parsed = new URL(origin);
    const isLocal = host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
    return parsed.host.toLowerCase() === host.toLowerCase()
      && (parsed.protocol === 'https:' || (isLocal && parsed.protocol === 'http:'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ status: 'error', message: 'Solicitud no permitida.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const idToken = typeof body?.idToken === 'string' ? body.idToken : '';
    if (idToken.length < 100) {
      return NextResponse.json({ status: 'error', message: 'Token no válido.' }, { status: 400 });
    }

    const decoded = await auth.verifyIdToken(idToken, true);
    const now = Math.floor(Date.now() / 1000);
    if (!decoded.auth_time || now - decoded.auth_time > recentAuthWindowSeconds) {
      return NextResponse.json(
        { status: 'error', message: 'Vuelve a iniciar sesión para renovar la sesión.' },
        { status: 401 }
      );
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json(
      { status: 'error', message: 'No se pudo crear la sesión.' },
      { status: 401 }
    );
  }
}
