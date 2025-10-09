
import { NextRequest, NextResponse } from 'next/server';

// This middleware is now simpler. It only checks for the *presence* of a cookie.
// The actual validation of the cookie's content is moved to the Server Component layer (AdminLayout)
// where Node.js APIs like `process.env` are available.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    // If the cookie doesn't even exist, redirect to login immediately.
    if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL('/verify', request.url));
    }
  }

  // If the cookie exists, let the request proceed. The AdminLayout will do the final verification.
  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
