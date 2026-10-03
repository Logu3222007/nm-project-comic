import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Check if Google OAuth credentials exist in environment
    if (!clientId || !clientSecret) {
      const missingVars: string[] = [];
      if (!clientId) missingVars.push("GOOGLE_CLIENT_ID");
      if (!clientSecret) missingVars.push("GOOGLE_CLIENT_SECRET");

      console.warn(
        `[GOOGLE OAUTH] Missing required environment variables: ${missingVars.join(", ")}`
      );

      const redirectUrl = new URL("/login", req.nextUrl.origin);
      redirectUrl.searchParams.set("error", "missing_credentials");
      redirectUrl.searchParams.set("missing", missingVars.join(","));
      return NextResponse.redirect(redirectUrl);
    }

    // Determine redirect URI (callback)
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/callback/google`;

    // Generate secure state parameter for CSRF mitigation
    const state = crypto.randomBytes(24).toString("hex");

    // Construct Google OAuth 2.0 Authorization Endpoint URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    const response = NextResponse.redirect(googleAuthUrl);

    // Save state in temporary secure HTTP-only cookie (10 min expiry)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    const errorUrl = new URL("/login", req.nextUrl.origin);
    errorUrl.searchParams.set("error", "oauth_init_failed");
    return NextResponse.redirect(errorUrl);
  }
}
