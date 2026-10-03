import { UserProfile } from "@/types/auth";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Internal server-side storage path
const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/**
 * Hash password securely with scrypt and a unique salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify password against stored salt:hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  try {
    const [salt, key] = storedHash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// In-memory cache for speed and consistency
let usersCache: UserProfile[] | null = null;

function loadUsers(): UserProfile[] {
  if (usersCache !== null) return usersCache;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, "utf-8");
      usersCache = JSON.parse(content);
      return usersCache || [];
    }
  } catch (err) {
    console.error("Failed to load users from file, initializing in-memory store", err);
  }

  // No fake users - only real registered accounts
  usersCache = [];
  return usersCache;
}

function saveUsers(users: UserProfile[]): void {
  usersCache = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist users to file", err);
  }
}

/**
 * Look up user by email (case-insensitive and trimmed).
 */
export function findUserByEmail(email: string): UserProfile | null {
  const users = loadUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

/**
 * Look up user by ID.
 */
export function findUserById(id: string): UserProfile | null {
  const users = loadUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Look up user by Google provider ID.
 */
export function findUserByGoogleId(googleId: string): UserProfile | null {
  const users = loadUsers();
  return users.find((u) => u.providerId === googleId) || null;
}

/**
 * Create a new user record.
 */
export function createUser(params: {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  authProvider: "email" | "google";
  providerId?: string;
  verified?: boolean;
}): UserProfile {
  const users = loadUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  const newUser: UserProfile = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    name: params.name.trim(),
    email: normalizedEmail,
    avatarUrl:
      params.avatarUrl ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(normalizedEmail)}`,
    role: "creator",
    plan: "studio-pro",
    credits: 100000,
    tokenUsage: 0,
    totalComicsCreated: 0,
    verified: params.verified ?? (params.authProvider === "google"),
    authProvider: params.authProvider,
    providerId: params.providerId,
    passwordHash: params.password ? hashPassword(params.password) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/**
 * Link an existing user account to Google OAuth.
 */
export function linkGoogleAccount(
  userId: string,
  googleId: string,
  avatarUrl?: string
): UserProfile | null {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    authProvider: "google",
    providerId: googleId,
    verified: true,
    avatarUrl: avatarUrl || users[index].avatarUrl,
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);
  return users[index];
}

/**
 * Strip sensitive server fields before returning to frontend.
 */
export function toSafeUser(user: UserProfile): UserProfile {
  const { passwordHash: _hash, ...safeUser } = user;
  return safeUser as UserProfile;
}

/**
 * Return all registered real users without sensitive password hashes.
 */
export function getAllUsers(): UserProfile[] {
  const users = loadUsers();
  return users.map(toSafeUser);
}

/**
 * Update user profile details (avatar, name, bio, routine).
 */
export function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    routine?: string;
  }
): UserProfile | null {
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...(updates.name ? { name: updates.name.trim() } : {}),
    ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl.trim() } : {}),
    ...(updates.bio !== undefined ? { bio: updates.bio.trim() } : {}),
    ...(updates.routine !== undefined ? { routine: updates.routine.trim() } : {}),
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);
  return toSafeUser(users[index]);
}

