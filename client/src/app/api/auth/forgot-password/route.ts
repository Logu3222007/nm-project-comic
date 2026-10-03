import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/user-store";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);

    // In production with email transport (e.g., SendGrid/Resend/SMTP):
    // generate reset token, store hash, and send email.
    if (user) {
      console.log(`[AUTH] Password reset requested for: ${cleanEmail}`);
    }

    // Always return safe generic confirmation without revealing account presence
    return NextResponse.json({
      success: true,
      message: "If an account exists for this email, you'll receive instructions to reset your password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request. Please try again later." },
      { status: 500 }
    );
  }
}
