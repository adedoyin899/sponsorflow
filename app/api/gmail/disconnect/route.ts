/**
 * POST /api/gmail/disconnect — Clears Gmail tokens for the user
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { disconnectGmail } from "@/lib/gmail";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await disconnectGmail(user.id);
    return NextResponse.json({
      success: true,
      message: "Gmail disconnected successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect Gmail" },
      { status: 500 }
    );
  }
}
