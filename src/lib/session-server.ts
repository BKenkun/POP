import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { getIdleTimeoutMs, SESSION_MAX_AGE_SECONDS } from '@/lib/session-timeout';

export const SESSION_ACTIVITY_COOKIE_NAME = 'session_activity';

interface ActivityPayload {
  uid: string;
  isAdmin: boolean;
  lastActiveAt: number;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __purorushSessionSigningSecret: string | undefined;
}

function getSigningSecret(): string {
  const envSecret =
    process.env.SESSION_SECRET ||
    process.env.SESSION_SIGNING_SECRET ||
    process.env.NEXTAUTH_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    return envSecret.trim();
  }
  if (!globalThis.__purorushSessionSigningSecret) {
    globalThis.__purorushSessionSigningSecret = crypto.randomBytes(32).toString('hex');
  }
  return globalThis.__purorushSessionSigningSecret;
}

function signData(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createActivityToken(params: {
  uid: string;
  isAdmin: boolean;
  now?: number;
}): { token: string; timeoutMs: number; expiresAt: number } {
  const now = params.now ?? Date.now();
  const timeoutMs = getIdleTimeoutMs(params.isAdmin);
  const expiresAt = now + timeoutMs;

  const payload: ActivityPayload = {
    uid: params.uid,
    isAdmin: params.isAdmin,
    lastActiveAt: now,
    expiresAt,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signData(encodedPayload);
  return {
    token: `${encodedPayload}.${signature}`,
    timeoutMs,
    expiresAt,
  };
}

export function verifyActivityToken(
  token: string | undefined | null
): { valid: boolean; expired: boolean; payload: ActivityPayload | null } {
  if (!token || typeof token !== 'string') {
    return { valid: false, expired: false, payload: null };
  }

  const dotIndex = token.indexOf('.');
  if (dotIndex <= 0) {
    return { valid: false, expired: false, payload: null };
  }

  const encodedPayload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!encodedPayload || !signature) {
    return { valid: false, expired: false, payload: null };
  }

  const expectedSig = signData(encodedPayload);
  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, expired: false, payload: null };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as ActivityPayload;

    if (!parsed?.uid || typeof parsed.expiresAt !== 'number') {
      return { valid: false, expired: false, payload: null };
    }

    if (Date.now() > parsed.expiresAt) {
      return { valid: false, expired: true, payload: parsed };
    }

    return { valid: true, expired: false, payload: parsed };
  } catch {
    return { valid: false, expired: false, payload: null };
  }
}

export function isHttpsRequest(request: NextRequest): boolean {
  return (
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:'
  );
}

export function verifySameOriginRequest(request: NextRequest): boolean {
  const originHeader = request.headers.get('origin');
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostHeader = forwardedHost || request.headers.get('host');

  if (originHeader && hostHeader) {
    try {
      const originHost = new URL(originHeader).host;
      if (originHost !== hostHeader) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

export function buildCookieOptions(request: NextRequest, maxAge = SESSION_MAX_AGE_SECONDS) {
  const isHttps = isHttpsRequest(request);
  return {
    maxAge,
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };
}
