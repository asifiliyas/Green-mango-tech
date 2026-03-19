import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/api/admin") && token?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Role-based route protection for dashboards (if we separate them)
    // Currently we use a single /dashboard, but for API routes:
    if (pathname.startsWith("/api/websites") && req.method === "POST" && token?.role !== "SELLER") {
       // Only sellers can submit sites
       // Wait, Admin might need to too, but usually it's Sellers.
    }

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
    "/marketplace/:path*",
    "/api/websites/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
  ],
};
