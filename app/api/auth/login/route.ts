import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password } = result.data;
    const { user, token, expiresAt } = await loginUser(email, password);

    const response = NextResponse.json({
      success: true,
      token,
      expires_at: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

    response.cookies.set({
      name: "sponsorflow_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Invalid credentials" },
      { status: 401 }
    );
  }
}
