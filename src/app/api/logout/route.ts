import { NextRequest, NextResponse } from 'next/server';
import { areAdminCredentialsAvailable, runWithAdminAuth } from '@/lib/firebase-admin';
import {
  buildCookieOptions,
  SESSION_ACTIVITY_COOKIE_NAME,
  verifySameOriginRequest,
} from '@/lib/session-server';

export async function POST(request: NextRequest) {
  if (!verifySameOriginRequest(request)) {
    return NextResponse.json(
      { status: 'error', message: 'Forbidden origin.' },
      { status: 403 }
    );
  }

  const sessionCookie = request.cookies.get('session')?.value;
  if (sessionCookie && areAdminCredentialsAvailable()) {
    try {
      await runWithAdminAuth(async (a) => {
        const decoded = await a.verifySessionCookie(sessionCookie);
        await a.revokeRefreshTokens(decoded.sub);
      }, 'logout-revoke');
    } catch {
      // Best-effort revocation; cookies are still cleared below
    }
  }

  const expiredCookieOptions = {
    value: '',
    ...buildCookieOptions(request, 0),
  };

  const response = NextResponse.json({ status: 'success' });
  response.cookies.set({ name: 'session', ...expiredCookieOptions });
  response.cookies.set({ name: 'session_id_token', ...expiredCookieOptions });
  response.cookies.set({ name: SESSION_ACTIVITY_COOKIE_NAME, ...expiredCookieOptions });

  return response;
}
