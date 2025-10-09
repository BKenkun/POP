
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebase } from '@/firebase/server';

// Initialize Firebase Admin SDK
initializeFirebase();

// This middleware now performs the FULL check: existence and validity.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    // 1. If the cookie doesn't even exist, redirect to login immediately.
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If the cookie exists, verify it with Firebase Admin SDK.
    try {
        const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
        
        // 3. Check if the authenticated user is the admin.
        if (decodedToken.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            console.warn(`Access denied for user: ${decodedToken.email}`);
            return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins to home
        }
        
        // User is the admin, allow request.
        return NextResponse.next();

    } catch (error) {
        // If verification fails (e.g., expired or invalid cookie), redirect to login.
        console.log("Middleware session verification error, redirecting to login...");
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If not a protected admin path, let the request proceed.
  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
