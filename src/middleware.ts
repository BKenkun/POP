
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    // The middleware now only checks for the generic session cookie.
    // The actual admin verification will happen inside the admin layout itself.
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      // If the user isn't logged in at all, redirect to the login page.
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = `?redirect=${pathname}`
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin/:path*'],
}
