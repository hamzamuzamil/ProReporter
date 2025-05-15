import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-url", request.url)

  // Create a Supabase client
  const supabase = createServerClient()

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/upload",
    "/analysis",
    "/reports",
    "/teams",
    "/templates",
    "/profile",
    "/settings",
  ]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Define auth routes
  const authRoutes = ["/auth"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to auth page if trying to access protected route without authentication
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if trying to access auth page while authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - shared (public shared reports)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|shared).*)",
  ],
}
