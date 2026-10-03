import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Forward to /api/auth/callback/google preserving all search params
  const target = new URL("/api/auth/callback/google", req.nextUrl.origin);
  req.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target);
}
