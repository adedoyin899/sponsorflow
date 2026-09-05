import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, passwordConfirm } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Account created. Verification email sent.",
      user_id: "demo-user-id",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process signup" }, { status: 500 });
  }
}
