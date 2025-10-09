
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin/:path*'],
}
