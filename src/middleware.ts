import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/firebase/admin'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function middleware(req: NextRequest) {
    const sessionCookie = req.cookies.get('session')?.value;
    const { pathname } = req.nextUrl;
 
    // --- Rutas solo admin ---
    if (pathname.startsWith('/admin')) {
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
        }
        try {
            const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
            if (claims.email !== ADMIN_EMAIL) {
                return NextResponse.redirect(new URL('/account', req.url));
            }
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL('/login?redirect=/admin', req.url));
        }
    }
 
    // --- Páginas de documentación interna: solo admin ---
    if (
        pathname.startsWith('/site-documentation') ||
        pathname.startsWith('/hilow-integration-guide')
    ) {
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        try {
            const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
            if (claims.email !== ADMIN_EMAIL) {
                return NextResponse.redirect(new URL('/', req.url));
            }
            return NextResponse.next();
        } catch {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }
 
    return NextResponse.next();
}
 
export const config = {
    matcher: [
        '/admin/:path*',
        '/site-documentation/:path*',
        '/site-documentation',
        '/hilow-integration-guide/:path*',
        '/hilow-integration-guide',
    ],
}