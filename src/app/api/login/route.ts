import { NextRequest, NextResponse } from 'next/server';
import {
  auth,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminAuth,
} from '@/lib/firebase-admin';

// Duration of the session cookie in milliseconds (5 days).
const expiresIn = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json(
      { status: 'error', message: 'Missing authentication token.' },
      { status: 400 }
    );
  }

  const isHttps =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:';

  if (areAdminCredentialsAvailable()) {
    try {
      const sessionCookie = await runWithAdminAuth(
        (a) => a.createSessionCookie(idToken, { expiresIn }),
        'session-cookie'
      );
      const response = NextResponse.json({ status: 'success' });
      response.cookies.set({
        name: 'session',
        value: sessionCookie,
        maxAge: expiresIn / 1000,
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? 'none' : 'lax',
        path: '/',
      });
      return response;
    } catch (error) {
      if (!isAdminCredentialError(error)) {
        return NextResponse.json(
          { status: 'error', message: 'Could not create session.' },
          { status: 401 }
        );
      }
    }
  }

  // Fallback when service account private key is unavailable in preview:
  // verify the ID token using Google's public x509 certificates and store it safely.
  try {
    await auth.verifyIdToken(idToken);
    const response = NextResponse.json({ status: 'success' });
    response.cookies.set({
      name: 'session_id_token',
      value: idToken,
      maxAge: 60 * 60, // 1 hour (standard Firebase ID token lifetime)
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Invalid authentication token.' },
      { status: 401 }
    );
  }
}
