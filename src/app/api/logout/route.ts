
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // To log out, we simply clear the session cookie.
  const options = {
    name: 'session',
    value: '',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  };

  const response = NextResponse.json({ status: 'success' });
  response.cookies.set(options);

  return response;
}
