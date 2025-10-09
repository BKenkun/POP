
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/app/actions/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected admin paths
  const adminPaths = ['/admin'];
  const isProtectedAdminPath = adminPaths.some(p => pathname.startsWith(p)) && pathname !== '/admin/verify';

  if (isProtectedAdminPath) {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/admin/verify', request.url));
    }
    
    const session = await decrypt(sessionCookie.value);
    
    if (!session?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/verify', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
}
