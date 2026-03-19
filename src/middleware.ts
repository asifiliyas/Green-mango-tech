import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role;

    // 1. Admin Dashboard Protection
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Admin API Protection
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3. Seller-only Dashboard Sections (if any)
    // Currently, /dashboard is shared and renders based on role internally.
    // This is fine as the components handle the role checks.

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
    "/api/admin/:path*",
  ],
};
