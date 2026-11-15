import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const isHttps =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:';

  const cookieOptions = {
    value: '',
    maxAge: 0,
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };

  const response = NextResponse.json({ status: 'success' });
  response.cookies.set({ name: 'session', ...cookieOptions });
  response.cookies.set({ name: 'session_id_token', ...cookieOptions });

  return response;
}
