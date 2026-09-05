/**
 * GET  /api/emails — List outreach emails for authenticated user
 * POST /api/emails — Update an email (approve, edit, reject, draft)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getEmailsForUser, updateEmailStatus } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const companyId = searchParams.get("companyId") || undefined;

  try {
    const emails = await getEmailsForUser(user.id, { status, companyId });
    return NextResponse.json({
      success: true,
      total: emails.length,
      emails,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch emails" },
      { status: 500 }
    );
  }
}

const updateEmailSchema = z.object({
  email_id: z.string().uuid("Invalid email ID"),
  status: z.enum([
    "draft",
    "approved",
    "ready_to_send",
    "sending",
    "sent",
    "delivered",
    "failed",
    "rejected",
  ]),
  subject: z.string().optional(),
  body: z.string().optional(),
  user_edits: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email_id, status, subject, body: emailBody, user_edits } = parsed.data;

    const updated = await updateEmailStatus(user.id, email_id, {
      status,
      subject,
      body: emailBody,
      userEdits: user_edits,
    });

    return NextResponse.json({
      success: true,
      email: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update email" },
      { status: 500 }
    );
  }
}
