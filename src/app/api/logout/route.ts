// Modificado por: Webmaster Freddy Poleo
import { NextRequest, NextResponse } from 'next/server';

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

  const response = NextResponse.json({ status: 'success' });
  response.cookies.set({
    name: 'session',
    value: '',
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
