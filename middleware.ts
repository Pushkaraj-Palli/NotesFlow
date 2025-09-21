// Middleware for authentication and security
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, createErrorResponse } from "@/lib/api-utils";

const JWT_SECRET_MIDDLEWARE = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
console.log("middleware.ts: JWT_SECRET used for verification:", JWT_SECRET_MIDDLEWARE); // Log JWT_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // CSP header for enhanced security
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com;",
  )

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // if (isProtectedRoute) {
  //   const authHeader = request.headers.get("authorization");
  //   console.log("middleware.ts: Protected route access. Authorization header:", authHeader); // Log auth header
  //   const token = authHeader?.split(" ")[1];

  //   if (!token) {
  //     console.error("middleware.ts: No token found for protected route."); // Log error
  //     return createErrorResponse("Unauthorized", 401);
  //   }

  //   console.log("middleware.ts: Attempting to verify token for protected route.", token); // Log token
  //   const decoded = await verifyToken(token);
  //   if (!decoded) {
  //     console.error("middleware.ts: Token verification failed for protected route."); // Log error
  //     return createErrorResponse("Unauthorized", 401);
  //   }
  //   console.log("middleware.ts: Token successfully verified for protected route.", decoded); // Log decoded
  //   return response;
  // }

  // Redirect authenticated users away from auth pages
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    const authHeader = request.headers.get("authorization");
    console.log("middleware.ts: Auth route access. Authorization header:", authHeader); // Log auth header
    const token = authHeader?.split(" ")[1];
    if (token && (await verifyToken(token))) {
      console.log("middleware.ts: User is authenticated on auth route. Redirecting to dashboard."); // Log redirect
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    console.log("middleware.ts: User not authenticated or no token on auth route."); // Log no redirect
    return response;
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export const runtime = 'nodejs'; // Use Node.js runtime
