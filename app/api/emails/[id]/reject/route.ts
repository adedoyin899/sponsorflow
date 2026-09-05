/**
 * POST /api/emails/:id/reject — Marks an outreach draft as rejected
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateEmailStatus } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emailId = params.id;
  if (!emailId) {
    return NextResponse.json({ error: "Missing email ID" }, { status: 400 });
  }

  try {
    const updated = await updateEmailStatus(user.id, emailId, {
      status: "rejected",
    });

    return NextResponse.json({
      success: true,
      email_id: updated.id,
      status: updated.status,
    });
  } catch (error: any) {
    console.error("Error rejecting email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject email" },
      { status: 500 }
    );
  }
}
