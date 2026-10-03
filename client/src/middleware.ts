import { NextRequest, NextResponse } from "next/server";

// Auth session cookie name
const SESSION_COOKIE_NAME = "comic_auth_session";

// Protected routes requiring authentication
const PROTECTED_PREFIXES = ["/dashboard"];

// Authentication routes that authenticated users should be redirected away from
const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionCookie);

  // Check if accessing a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isAuthenticated) {
    // Preserve requested destination for post-login redirection
    // Prevent open redirect vulnerabilities: ensure it's a relative path starting with /
    const returnUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?redirect=${returnUrl}`, req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and accessing login or signup, redirect to dashboard
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
};
