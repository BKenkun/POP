import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/firebase/admin'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function middleware(req: NextRequest) {
    const sessionCookie = req.cookies.get('session')?.value;

    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login?redirect=/admin', req.url))
    }

    try {
        const claims = await adminAuth().verifySessionCookie(sessionCookie, true);

        if (claims.email !== ADMIN_EMAIL) {
            return NextResponse.redirect(new URL('/account', req.url))
        }

        return NextResponse.next()
    } catch {
        return NextResponse.redirect(new URL('/login?redirect=/admin', req.url))
    }
}

export const config = {
    matcher: ['/admin/:path*'],
}