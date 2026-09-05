import { NextResponse } from "next/server";
import { z } from "zod";
import { signupUser } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirm: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password } = result.data;
    const user = await signupUser(email, password);

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Verification email sent.",
      user_id: user.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 400 }
    );
  }
}
