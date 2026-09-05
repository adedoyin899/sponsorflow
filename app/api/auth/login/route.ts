import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // In Prompt 3, full Supabase / bcrypt verification will be wired up
    const response = NextResponse.json({
      success: true,
      token: "demo-jwt-token",
      user: { id: "demo-user-id", email },
    });

    response.cookies.set({
      name: "sponsorflow_session",
      value: "demo-jwt-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to log in" }, { status: 500 });
  }
}
