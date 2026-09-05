/**
 * GET /api/auth/google-callback
 *
 * Google OAuth 2.0 callback handler.
 *
 * Flow:
 *  1. Validate `state` param against cookie (CSRF protection)
 *  2. Exchange `code` for Google access token
 *  3. Fetch user's Google profile (email, name, id)
 *  4. Find or create the SponsorFlow user in the database
 *  5. Generate JWT session token, set secure HTTP-only cookie
 *  6. Redirect to /dashboard (new users) or /dashboard (returning users)
 *
 * Error cases redirect to /login?error=... so the user always lands on a page.
 */

import { NextResponse } from "next/server";
import { exchangeGoogleCode, getGoogleProfile } from "@/lib/google-oauth";
import { getOrCreateGoogleUser, createSession } from "@/lib/db";
import { generateToken } from "@/lib/auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const COOKIE_NAME = "sponsorflow_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  // ── 0. Handle Google-side denial ────────────────────────────────────────────
  if (errorParam) {
    const msg = errorParam === "access_denied"
      ? "You declined Google sign-in. You can sign in with email instead."
      : `Google OAuth error: ${errorParam}`;
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent(msg)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Missing authorization code from Google")}`
    );
  }

  // ── 1. CSRF: validate state param against cookie ─────────────────────────────
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieState = parseCookie(cookieHeader, "google_oauth_state");

  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Invalid OAuth state — possible CSRF attack. Please try again.")}`
    );
  }

  try {
    // ── 2. Exchange code for tokens ─────────────────────────────────────────────
    const tokens = await exchangeGoogleCode(code);

    // ── 3. Fetch Google profile ────────────────────────────────────────────────
    const googleProfile = await getGoogleProfile(tokens.access_token);

    if (!googleProfile.verified_email) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=${encodeURIComponent("Your Google email address is not verified. Please verify it and try again.")}`
      );
    }

    // ── 4. Find or create SponsorFlow user ─────────────────────────────────────
    const { user, isNew } = await getOrCreateGoogleUser({
      googleId: googleProfile.id,
      email: googleProfile.email,
      firstName: googleProfile.given_name || "",
      lastName: googleProfile.family_name || "",
    });

    // ── 5. Generate JWT + persist session ──────────────────────────────────────
    const token = generateToken({ userId: user.id, email: user.email });
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // Persist session in DB (non-blocking — don't throw if this fails)
    try {
      await createSession(user.id, token, expiresAt.toISOString());
    } catch (sessionErr) {
      console.error("[google-callback] Failed to persist session:", sessionErr);
    }

    // ── 6. Build redirect response with session cookie ──────────────────────────
    // New users go to onboarding; returning users go to dashboard
    const redirectTo = isNew ? `${APP_URL}/onboarding` : `${APP_URL}/dashboard`;
    const response = NextResponse.redirect(redirectTo);

    // Set session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // Clear the CSRF state cookie
    response.cookies.set({
      name: "google_oauth_state",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("[google-callback] Error:", error);
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent(
        error.message || "An unexpected error occurred during Google sign-in. Please try again."
      )}`
    );
  }
}

/**
 * Parse a specific cookie value from a Cookie header string.
 * Avoids importing next/headers in a route handler that only needs one value.
 */
function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
