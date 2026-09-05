import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // In Prompt 4, code exchange with Google OAuth and Supabase Auth will be wired up
  const response = NextResponse.json({
    success: true,
    message: "Google OAuth authenticated successfully",
    code,
  });

  response.cookies.set({
    name: "sponsorflow_session",
    value: "demo-google-jwt-token",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
