import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user is accessing dashboard but subscription is not active
    if (path.startsWith("/dashboard") && path !== "/dashboard/subscription" && path !== "/dashboard/support" && token?.subscriptionStatus !== "ACTIVE") {
      // Allow admin to access regardless? Maybe not specified.
      // But if role is ADMIN, maybe allow?
      if (token?.role === "ADMIN") {
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
