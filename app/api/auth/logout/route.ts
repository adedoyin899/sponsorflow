import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutUser } from "@/lib/auth";

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get("sponsorflow_session")?.value;

  if (token) {
    await logoutUser(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  response.cookies.set({
    name: "sponsorflow_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
