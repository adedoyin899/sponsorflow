/**
 * GET /api/auth/google
 *
 * Initiates the Google OAuth 2.0 authorization flow.
 * Generates a CSRF state token, stores it in a short-lived cookie,
 * then redirects the browser to Google's OAuth consent screen.
 */

import { NextResponse } from "next/server";
import { buildGoogleOAuthUrl, generateOAuthState } from "@/lib/google-oauth";

export async function GET() {
  try {
    const state = generateOAuthState();
    const authUrl = buildGoogleOAuthUrl(state);

    const response = NextResponse.redirect(authUrl);

    // Store state in a short-lived, HTTP-only cookie for CSRF validation
    response.cookies.set({
      name: "google_oauth_state",
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes — enough to complete the OAuth flow
    });

    return response;
  } catch (error: any) {
    // If Google credentials aren't configured, redirect to signup with an error
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/signup?error=${encodeURIComponent(error.message || "Google OAuth is not configured")}`
    );
  }
}
