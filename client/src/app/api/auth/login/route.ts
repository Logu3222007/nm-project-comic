import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, toSafeUser } from "@/lib/auth/user-store";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Email regex validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const { email, password, rememberMe } = body;

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Validate password presence
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    // Message confirming only already registered users can log in
    const genericAuthError = "Invalid email or password. Only registered creators can sign in. Please verify your credentials or sign up.";

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: genericAuthError }, { status: 401 });
    }

    // Authentication succeeded
    const safeUser = toSafeUser(user);
    const token = createSessionToken(safeUser.id, Boolean(rememberMe));
    const cookieOptions = getSessionCookieOptions(Boolean(rememberMe));

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Successfully signed in",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected authentication error occurred. Please try again." },
      { status: 500 }
    );
  }
}
