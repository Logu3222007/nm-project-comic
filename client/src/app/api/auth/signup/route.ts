import { NextResponse } from "next/server";
import { findUserByEmail, createUser, toSafeUser } from "@/lib/auth/user-store";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const { name, email, password, confirmPassword } = body;

    // Validate Name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    // Validate Email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Validate Password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Validate Password Confirmation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = findUserByEmail(cleanEmail);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Create user securely
    const newUser = createUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      authProvider: "email",
      verified: true,
    });

    const safeUser = toSafeUser(newUser);
    const token = createSessionToken(safeUser.id, false);
    const cookieOptions = getSessionCookieOptions(false);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Account created successfully.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again later." },
      { status: 500 }
    );
  }
}
