/**
 * POST /api/emails/send — Dispatches a single approved outreach email via Gmail
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canSendEmail, recordEmailDispatched } from "@/lib/db";
import { sendGmailEmail } from "@/lib/gmail";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const sendSchema = z.object({
  outreach_email_id: z.string().uuid("Invalid email ID"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const emailId = parsed.data.outreach_email_id;
    const supabase = createServerSupabaseClient();

    // 1. Fetch outreach email record
    const { data: emailRecord } = await (supabase
      .from("outreach_emails")
      .select("*")
      .eq("id", emailId)
      .eq("user_id", user.id)
      .maybeSingle() as unknown as Promise<{ data: any }>);

    if (!emailRecord) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // 2. Check rate limit
    const rateCheck = await canSendEmail(user.id);
    if (!rateCheck.canSend) {
      return NextResponse.json(
        { error: rateCheck.reason || "Rate limit reached" },
        { status: 429 }
      );
    }

    // 3. Dispatch via Gmail API
    const dispatchResult = await sendGmailEmail(user.id, {
      to: emailRecord.to_email,
      subject: emailRecord.subject,
      body: emailRecord.body,
    });

    // 4. Update status in database & increment counts
    const updated = await recordEmailDispatched(
      user.id,
      emailId,
      dispatchResult.messageId,
      dispatchResult.threadId
    );

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      email: updated,
      gmail_message_id: dispatchResult.messageId,
      gmail_thread_id: dispatchResult.threadId,
    });
  } catch (error: any) {
    console.error("Email send failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
