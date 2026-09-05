/**
 * PUT /api/emails/:id — Update outreach email draft, content, or approval status
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { updateEmailStatus } from "@/lib/db";
import { OutreachStatus } from "@/types/database";

const updateSchema = z.object({
  status: z.enum([
    "draft",
    "approved",
    "ready_to_send",
    "sending",
    "sent",
    "delivered",
    "failed",
    "rejected",
  ]).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  user_edits: z.string().optional(),
});

export async function PUT(
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
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { status, subject, body: emailBody, user_edits } = parsed.data;

    const updated = await updateEmailStatus(user.id, emailId, {
      status: (status as OutreachStatus) || "draft",
      subject,
      body: emailBody,
      userEdits: user_edits,
    });

    return NextResponse.json({
      success: true,
      email_id: updated.id,
      status: updated.status,
      email: updated,
    });
  } catch (error: any) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email" },
      { status: 500 }
    );
  }
}
