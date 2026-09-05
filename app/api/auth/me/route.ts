import { NextResponse } from "next/server";
import { getCurrentUser, verifyToken } from "@/lib/auth";
import { getUserProfile } from "@/lib/db";

export async function GET(req: Request) {
  let token: string | undefined;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Fetch user
  const user = await getCurrentUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      email_verified: user.email_verified,
      created_at: user.created_at,
    },
    profile,
  });
}
