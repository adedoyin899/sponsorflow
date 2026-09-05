/**
 * GET /api/gmail/status — Checks if user has an active Gmail integration
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGmailStatus } from "@/lib/gmail";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = await getGmailStatus(user.id);
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check Gmail status" },
      { status: 500 }
    );
  }
}
