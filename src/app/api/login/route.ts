import { NextRequest, NextResponse } from 'next/server';
import {
  auth,
  areAdminCredentialsAvailable,
  isAdminCredentialError,
  runWithAdminAuth,
} from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin';
import { SESSION_MAX_AGE_SECONDS } from '@/lib/session-timeout';
import {
  buildCookieOptions,
  createActivityToken,
  SESSION_ACTIVITY_COOKIE_NAME,
  verifySameOriginRequest,
} from '@/lib/session-server';

const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE_SECONDS * 1000;

export async function POST(request: NextRequest) {
  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden origin.' },
      { status: 403 }
    );
  }

  let body: { idToken?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const { idToken } = body;
  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json(
      { status: 'error', message: 'Missing authentication token.' },
      { status: 400 }
    );
  }

  let decodedToken: { uid: string; email?: string };
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Invalid authentication token.' },
      { status: 401 }
    );
  }

  const userIsAdmin = isAdminEmail(decodedToken.email);
  const activity = createActivityToken({
    uid: decodedToken.uid,
    isAdmin: userIsAdmin,
  });

  if (areAdminCredentialsAvailable()) {
    try {
      const sessionCookie = await runWithAdminAuth(
        (a) => a.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRES_IN_MS }),
        'session-cookie'
      );
      const response = NextResponse.json({
        status: 'success',
        timeoutMs: activity.timeoutMs,
        expiresAt: activity.expiresAt,
        isAdmin: userIsAdmin,
      });
      response.cookies.set({
        name: 'session',
        value: sessionCookie,
        ...buildCookieOptions(request, SESSION_MAX_AGE_SECONDS),
      });
      response.cookies.set({
        name: SESSION_ACTIVITY_COOKIE_NAME,
        value: activity.token,
        ...buildCookieOptions(request, SESSION_MAX_AGE_SECONDS),
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

  // Fallback when service account private key is unavailable in preview
  const response = NextResponse.json({
    status: 'success',
    timeoutMs: activity.timeoutMs,
    expiresAt: activity.expiresAt,
    isAdmin: userIsAdmin,
  });
  response.cookies.set({
    name: 'session_id_token',
    value: idToken,
    ...buildCookieOptions(request, 60 * 60),
  });
  response.cookies.set({
    name: SESSION_ACTIVITY_COOKIE_NAME,
    value: activity.token,
    ...buildCookieOptions(request, SESSION_MAX_AGE_SECONDS),
  });
  return response;
}
