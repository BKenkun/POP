
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedAdminPath = pathname.startsWith('/admin');

  if (isProtectedAdminPath) {
    // This cookie is set by our /api/login endpoint.
    // It's an HttpOnly cookie, so it's secure.
    const sessionCookie = request.cookies.get('session')?.value;
    
    // If the session cookie doesn't exist at all, redirect to login.
    if (!sessionCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = `?redirect=${pathname}` // Keep track of where the user wanted to go
      return NextResponse.redirect(url);
    }
  }

  // If checks pass, allow the request to continue.
  return NextResponse.next();
}

// This config ensures the middleware runs only for admin routes.
export const config = {
  matcher: ['/admin/:path*'],
}
