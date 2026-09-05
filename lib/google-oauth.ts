/**
 * SponsorFlow: Google OAuth 2.0 Helper
 *
 * Handles:
 *  1. Building the Google authorization URL
 *  2. Exchanging an auth code for tokens
 *  3. Fetching the user's Google profile
 *
 * Uses the Google OAuth 2.0 REST endpoints directly — no googleapis SDK needed
 * at this layer; googleapis is reserved for Gmail API calls in Prompt 9/10.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export interface GoogleTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

/**
 * Build the Google OAuth 2.0 authorization URL.
 * The `state` param is a random nonce to prevent CSRF.
 */
export function buildGoogleOAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google-callback`;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      // NOTE: Gmail scopes (gmail.send, gmail.readonly) will be requested
      // separately in Prompt 9 (Gmail OAuth Integration) to keep the initial
      // auth scope minimal and avoid permission-scope fatigue at sign-up.
    ].join(" "),
    access_type: "offline",  // request refresh_token for future Gmail use
    prompt: "consent",       // always show consent screen so refresh_token is returned
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange a Google authorization code for access + id tokens.
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google-callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || "Failed to exchange Google auth code");
  }

  return data as GoogleTokens;
}

/**
 * Fetch the authenticated user's Google profile using the access token.
 */
export async function getGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Failed to fetch Google user profile");
  }

  if (!data.email) {
    throw new Error("Google profile is missing required email field");
  }

  return data as GoogleProfile;
}

/**
 * Generate a cryptographically secure random state string for CSRF protection.
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
