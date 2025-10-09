
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase } from '@/firebase/server';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// Initialize Firebase Admin SDK if not already done
initializeFirebase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Set session expiration to 5 days for regular users.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    
    // Create the session cookie. This will also verify the ID token in the process.
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    // Create the response object to attach cookies to
    const response = NextResponse.json({ status: 'success', isAdmin: decodedToken.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL });
    
    // Set the main session cookie
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    
    // If the user is the admin, create a separate, encrypted admin session cookie.
    if (decodedToken.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        const adminExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for admin
        const adminSession = await encrypt({ user: { email: decodedToken.email, isAdmin: true }, expires: adminExpires });

        response.cookies.set({
          name: 'admin_session',
          value: adminSession,
          expires: adminExpires,
          httpOnly: true,
          path: '/',
        });
    }

    return response;

  } catch (error: any) {
    console.error('Session login error:', error);
    return NextResponse.json({ error: 'Failed to create session.', details: error.message }, { status: 401 });
  }
}
