import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SaaS Route Protection Middleware
 * - Blocks /dashboard and /settings if no token is found
 * - Redirects authenticated users away from /login or /signup
 */
export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. If trying to access protected routes without a token
    const protectedRoutes = ['/dashboard', '/employees', '/leave', '/helpdesk', '/interviews'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        // Save the tried url to redirect after login (optional professional touch)
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. If trying to access auth pages with a valid token
    const authPages = ['/login', '/signup', '/setup'];
    const isAuthPage = authPages.some(page => pathname.startsWith(page));

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Optimization: Match only page routes
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
