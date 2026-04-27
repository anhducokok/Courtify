import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
    const hasToken = req.cookies.has('access_token') || req.cookies.has('refresh_token');
    const { pathname } = req.nextUrl;

    // Redirect unauthenticated users away from protected routes
    const isProtected = pathname.startsWith('/bookings') || pathname.startsWith('/history');
    if (isProtected && !hasToken) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect already-authenticated users away from login/register
    if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && hasToken) {
        return NextResponse.redirect(new URL('/courts', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/login', '/register', '/bookings/:path*', '/history/:path*'],
};
