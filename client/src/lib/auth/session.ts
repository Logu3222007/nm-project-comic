import crypto from "crypto";
import { UserProfile } from "@/types/auth";
import { findUserById, toSafeUser } from "./user-store";

export const SESSION_COOKIE_NAME = "comic_auth_session";

// Secret key for HMAC signing (reads from env or persistent server default)
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "comiccraft-auth-production-secure-hmac-key-2026-studio";

interface SessionPayload {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed session token.
 */
export function createSessionToken(userId: string, rememberMe: boolean = false): string {
  const issuedAt = Date.now();
  // 30 days if rememberMe, otherwise 7 days
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const expiresAt = issuedAt + durationMs;

  const payload: SessionPayload = { userId, issuedAt, expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Validates the token and returns the userId if signature matches and not expired.
 */
export function verifySessionToken(token: string): string | null {
  if (!token || !token.includes(".")) return null;

  try {
    const [payloadB64, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payloadB64).digest("base64url");

    // Constant-time check on signature
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired session
    }

    return payload.userId;
  } catch {
    return null;
  }
}

/**
 * Cookie configuration builder for Next.js responses.
 */
export function getSessionCookieOptions(rememberMe: boolean = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // in seconds
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Resolves user from session token.
 */
export function getUserFromSessionToken(token?: string): UserProfile | null {
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  const user = findUserById(userId);
  return user ? toSafeUser(user) : null;
}
