import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/actions/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie?.value) {
        // Redirect to the new, root-level verify page
        return NextResponse.redirect(new URL('/verify', request.url));
    }
    
    try {
      const session = await decrypt(sessionCookie.value);
      
      if (!session?.isAdmin) {
          return NextResponse.redirect(new URL('/verify', request.url));
      }
    } catch (error) {
      console.error("Middleware decryption error:", error);
      // If decryption fails, it's a bad cookie, redirect to login
      return NextResponse.redirect(new URL('/verify', request.url));
    }
  }

  return NextResponse.next();
}

// Match the root /admin page AND all paths under it
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
