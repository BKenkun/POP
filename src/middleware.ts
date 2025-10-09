
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is for the admin area
  const isProtectedAdminPath = pathname.startsWith('/admin');

  if (isProtectedAdminPath) {
    // Check for the presence of the admin-specific session cookie
    const adminSessionCookie = request.cookies.get('admin_session')?.value;
    
    // If the admin session cookie doesn't exist, redirect to the login page.
    if (!adminSessionCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      // Pass the original destination as a redirect parameter
      url.search = `?redirect=${pathname}`
      return NextResponse.redirect(url);
    }
  }

  // If checks pass, or if it's not an admin path, allow the request to continue.
  return NextResponse.next();
}

// Config to specify which paths the middleware should run on.
export const config = {
  matcher: ['/admin/:path*'],
}
