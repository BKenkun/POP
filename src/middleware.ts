import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/actions/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie) {
        // Redirect to the new, root-level verify page
        return NextResponse.redirect(new URL('/verify', request.url));
    }
    
    const session = await decrypt(sessionCookie.value);
    
    if (!session?.isAdmin) {
        return NextResponse.redirect(new URL('/verify', request.url));
    }
  }

  return NextResponse.next();
}

// Match all paths under /admin, including the root /admin page
export const config = {
  matcher: ['/admin/:path*'],
}
