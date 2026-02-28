import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow ADMIN and SUPPORT roles to access admin pages
    if (path.startsWith("/dashboard/admin") || path === "/dashboard/admin/support") {
      if (token?.role === "ADMIN" || token?.role === "SUPPORT") {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // If user is accessing dashboard but subscription is not active
    if (path.startsWith("/dashboard") && path !== "/dashboard/subscription" && path !== "/dashboard/support" && token?.subscriptionStatus !== "ACTIVE") {
      // Allow admin and support to access regardless
      if (token?.role === "ADMIN" || token?.role === "SUPPORT") {
        return NextResponse.next()
      }
      
      return NextResponse.redirect(new URL("/dashboard/subscription", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = { matcher: ["/dashboard/:path*"] }
