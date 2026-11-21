import { NextRequest, NextResponse } from 'next/server';
import { auth, areAdminCredentialsAvailable, runWithAdminAuth } from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin';
import { SESSION_MAX_AGE_SECONDS } from '@/lib/session-timeout';
import {
  buildCookieOptions,
  createActivityToken,
  SESSION_ACTIVITY_COOKIE_NAME,
  verifyActivityToken,
  verifySameOriginRequest,
} from '@/lib/session-server';

function clearSessionCookies(request: NextRequest, response: NextResponse) {
  const cleared = { value: '', ...buildCookieOptions(request, 0) };
  response.cookies.set({ name: 'session', ...cleared });
  response.cookies.set({ name: 'session_id_token', ...cleared });
  response.cookies.set({ name: SESSION_ACTIVITY_COOKIE_NAME, ...cleared });
}

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
    body = {};
  }

  const existingActivity = request.cookies.get(SESSION_ACTIVITY_COOKIE_NAME)?.value;
  if (existingActivity) {
    const verification = verifyActivityToken(existingActivity);
    if (verification.expired) {
      const expiredRes = NextResponse.json(
        { status: 'expired', message: 'Session expired due to inactivity.' },
        { status: 401 }
      );
      clearSessionCookies(request, expiredRes);
      return expiredRes;
    }
  }

  let uid: string | null = null;
  let email: string | undefined;

  const sessionCookie = request.cookies.get('session')?.value;
  if (sessionCookie && areAdminCredentialsAvailable()) {
    try {
      const decoded = await runWithAdminAuth(
        (a) => a.verifySessionCookie(sessionCookie, true),
        'heartbeat-verify-session'
      );
      uid = decoded.uid;
      email = decoded.email;
    } catch {
      uid = null;
    }
  }

  const idTokenFromBody = typeof body.idToken === 'string' ? body.idToken : null;
  const fallbackCookieToken = request.cookies.get('session_id_token')?.value || null;
  const tokenToVerify = idTokenFromBody || (!uid ? fallbackCookieToken : null);

  if (!uid && tokenToVerify) {
    try {
      const decoded = await auth.verifyIdToken(tokenToVerify);
      uid = decoded.uid;
      email = decoded.email;
    } catch {
      uid = null;
    }
  }

  if (!uid) {
    const unauthRes = NextResponse.json(
      { status: 'unauthorized', message: 'No active session.' },
      { status: 401 }
    );
    clearSessionCookies(request, unauthRes);
    return unauthRes;
  }

  // Ensure activity cookie belongs to the authenticated user if present
  if (existingActivity) {
    const verification = verifyActivityToken(existingActivity);
    if (verification.payload && verification.payload.uid !== uid) {
      const mismatchRes = NextResponse.json(
        { status: 'unauthorized', message: 'Session mismatch.' },
        { status: 401 }
      );
      clearSessionCookies(request, mismatchRes);
      return mismatchRes;
    }
  }

  const userIsAdmin = isAdminEmail(email);
  const refreshedActivity = createActivityToken({
    uid,
    isAdmin: userIsAdmin,
  });

  const response = NextResponse.json({
    status: 'active',
    timeoutMs: refreshedActivity.timeoutMs,
    expiresAt: refreshedActivity.expiresAt,
    isAdmin: userIsAdmin,
  });

  response.cookies.set({
    name: SESSION_ACTIVITY_COOKIE_NAME,
    value: refreshedActivity.token,
    ...buildCookieOptions(request, SESSION_MAX_AGE_SECONDS),
  });

  if (idTokenFromBody && !sessionCookie) {
    response.cookies.set({
      name: 'session_id_token',
      value: idTokenFromBody,
      ...buildCookieOptions(request, 60 * 60),
    });
  }

  return response;
}
