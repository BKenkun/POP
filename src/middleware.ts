
import { NextRequest, NextResponse } from 'next/server';

// This middleware now only checks for the existence of the cookie.
// The actual verification is done in the AdminLayout.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    // If the cookie doesn't even exist, redirect to login immediately.
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // If cookie exists, let the request pass. The layout will do the verification.
    return NextResponse.next();
  }

  // If not a protected admin path, let the request proceed.
  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
