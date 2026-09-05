import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "./supabase-server";
import {
  createUser,
  getUserByEmail,
  getUserById,
  createSession,
  deleteSession,
} from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "sponsorflow-fallback-jwt-secret-key-development";
const COOKIE_NAME = "sponsorflow_session";

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload, expiresIn: string = "7d"): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function signupUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(normalizedEmail, passwordHash);

  return user;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);

  if (!user || !user.password_hash) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({ userId: user.id, email: user.email });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Store in user_sessions table
  await createSession(user.id, token, expiresAt.toISOString());

  return {
    user,
    token,
    expiresAt,
  };
}

export async function logoutUser(token?: string) {
  if (token) {
    await deleteSession(token);
  }
}

export async function getCurrentUser(tokenOverride?: string) {
  let token = tokenOverride;

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Not in server component with headers
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.userId);
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
