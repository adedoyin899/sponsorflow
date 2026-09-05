/**
 * GET /api/gmail/connect
 * Initiates the Gmail OAuth 2.0 flow to connect sending and reading scopes
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { buildGmailConnectUrl } from "@/lib/gmail";
import { generateOAuthState } from "@/lib/google-oauth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const state = generateOAuthState();

    // Store state nonce in HTTP-only cookie for CSRF verification
    const cookieStore = cookies();
    cookieStore.set("gmail_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    const googleUrl = buildGmailConnectUrl(state);
    return NextResponse.redirect(googleUrl);
  } catch (error: any) {
    console.error("Failed to initiate Gmail connect:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/emails?error=${encodeURIComponent(error.message || "Failed to start Gmail auth")}`, req.url)
    );
  }
}
