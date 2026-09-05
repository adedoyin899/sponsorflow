/**
 * GET /api/gmail/callback
 * Handles OAuth callback, exchanges code for tokens, and persists in gmail_tokens
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import {
  exchangeGmailCode,
  getGmailUserEmail,
  saveGmailTokens,
} from "@/lib/gmail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/emails?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/emails?error=Missing+code+or+state", req.url)
    );
  }

  // Validate CSRF state
  const cookieStore = cookies();
  const savedState = cookieStore.get("gmail_oauth_state")?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/dashboard/emails?error=Invalid+state+parameter", req.url)
    );
  }

  // Clear state cookie
  cookieStore.delete("gmail_oauth_state");

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const tokens = await exchangeGmailCode(code);
    const gmailEmail = await getGmailUserEmail(tokens.access_token);

    await saveGmailTokens(user.id, tokens, gmailEmail);

    return NextResponse.redirect(
      new URL("/dashboard/emails?gmail=connected", req.url)
    );
  } catch (err: any) {
    console.error("Gmail OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/emails?error=${encodeURIComponent(err.message || "Failed to link Gmail")}`, req.url)
    );
  }
}
