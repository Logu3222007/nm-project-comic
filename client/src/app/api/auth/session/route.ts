import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getUserFromSessionToken } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = getUserFromSessionToken(token);

    if (!user) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user,
    });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
    });
  }
}
