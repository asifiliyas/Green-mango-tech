import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protection for Dashboard
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protection for Marketplace
    if (path.startsWith('/marketplace') && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We check inside the middleware function for better control
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/marketplace/:path*', '/marketplace'],
};


