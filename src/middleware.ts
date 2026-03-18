import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin-only routes
    if (path.startsWith("/dashboard") && (token as any)?.role === "ADMIN") {
      // Admins are welcome
      return NextResponse.next()
    }

    // Role-based access for Seller Dashboard sections
    if (path.startsWith("/dashboard") && (token as any)?.role === "SELLER") {
       // Sellers are welcome
       return NextResponse.next()
    }

    // Role-based access for Buyer sections
    if (path === "/marketplace" && (token as any)?.role !== "BUYER") {
       // Allow admins to view but maybe not sellers? 
       // For this MVP, let's keep it open but favor Buyers.
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/marketplace/:path*"],
}
