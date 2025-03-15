import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If authenticated user tries to access root, redirect to dashboard
    if (token && path === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If not authenticated, allow access to root (sign-in) page only
    if (!token) {
      if (path === '/') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Only allow super_admin to access protected routes
    if (token.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true; // Let the middleware function handle the authorization
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
