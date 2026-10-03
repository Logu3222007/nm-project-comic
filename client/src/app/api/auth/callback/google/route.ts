import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  linkGoogleAccount,
} from "@/lib/auth/user-store";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const searchParams = req.nextUrl.searchParams;

  const errorParam = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Handle user cancellation or denial from Google
  if (errorParam) {
    console.warn(`[GOOGLE OAUTH CALLBACK] Google returned error: ${errorParam}`);
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", errorParam === "access_denied" ? "cancelled" : "oauth_denied");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  // Validate state cookie against CSRF
  const savedState = req.cookies.get("oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    console.warn("[GOOGLE OAUTH CALLBACK] Invalid OAuth state parameter mismatch");
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(redirectUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "missing_credentials");
    redirectUrl.searchParams.set("missing", "GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET");
    return NextResponse.redirect(redirectUrl);
  }

  // Compute matching redirect URI
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${protocol}://${host}/api/auth/callback/google`;

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[GOOGLE OAUTH CALLBACK] Token exchange failed:", errText);
      const redirectUrl = new URL("/login", origin);
      redirectUrl.searchParams.set("error", "token_exchange_failed");
      return NextResponse.redirect(redirectUrl);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile from Google UserInfo endpoint
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileResponse.ok) {
      console.error("[GOOGLE OAUTH CALLBACK] Failed to fetch userinfo from Google");
      const redirectUrl = new URL("/login", origin);
      redirectUrl.searchParams.set("error", "userinfo_failed");
      return NextResponse.redirect(redirectUrl);
    }

    const googleProfile = await profileResponse.json();
    const googleId: string = googleProfile.sub;
    const email: string = googleProfile.email;
    const name: string = googleProfile.name || "Creator";
    const picture: string = googleProfile.picture || "";
    const isEmailVerified: boolean = Boolean(googleProfile.email_verified);

    if (!email) {
      const redirectUrl = new URL("/login", origin);
      redirectUrl.searchParams.set("error", "no_email_provided");
      return NextResponse.redirect(redirectUrl);
    }

    // 3. User resolution: Match by Google ID, or link existing account by email, or create new
    let user = findUserByGoogleId(googleId);

    if (!user) {
      const existingByEmail = findUserByEmail(email);
      if (existingByEmail) {
        // Link existing account to Google
        user = linkGoogleAccount(existingByEmail.id, googleId, picture) || existingByEmail;
      } else {
        // Create new application user
        user = createUser({
          name,
          email,
          avatarUrl: picture,
          authProvider: "google",
          providerId: googleId,
          verified: isEmailVerified,
        });
      }
    }

    // 4. Create signed session token and set HTTP-only cookie
    const sessionToken = createSessionToken(user.id, true);
    const cookieOptions = getSessionCookieOptions(true);

    const destination = new URL("/dashboard", origin);
    const response = NextResponse.redirect(destination);

    // Set authenticated session cookie
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);

    // Delete temporary OAuth state cookie
    response.cookies.set("oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[GOOGLE OAUTH CALLBACK] Unexpected error:", error);
    const redirectUrl = new URL("/login", origin);
    redirectUrl.searchParams.set("error", "oauth_processing_error");
    return NextResponse.redirect(redirectUrl);
  }
}
