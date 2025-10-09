
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session'; // Import from the new session library

// This middleware now performs the FULL check: existence and validity.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    // 1. If the cookie doesn't even exist, redirect to login immediately.
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/verify', request.url));
    }

    // 2. If the cookie exists, decrypt and validate it.
    try {
        const session = await decrypt(sessionCookie);
        // If the session is invalid or doesn't have the isAdmin flag, redirect.
        if (!session?.isAdmin) {
             return NextResponse.redirect(new URL('/verify', request.url));
        }
    } catch (error) {
        // If decryption fails (e.g., expired or tampered cookie), redirect.
        console.log("Middleware decryption error, redirecting...");
        return NextResponse.redirect(new URL('/verify', request.url));
    }
  }

  // If the cookie is valid, let the request proceed.
  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
