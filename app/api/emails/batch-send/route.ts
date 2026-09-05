/**
 * POST /api/emails/batch-send
 * Dispatches a batch of approved emails respecting daily (20) & hourly (5) limits.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { canSendEmail, recordEmailDispatched } from "@/lib/db";
import { sendGmailEmail } from "@/lib/gmail";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const batchSendSchema = z.object({
  email_ids: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let emailIds: string[] = [];
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const parsed = batchSendSchema.safeParse(body);
      if (parsed.success && parsed.data.email_ids) {
        emailIds = parsed.data.email_ids;
      }
    }

    const supabase = createServerSupabaseClient();

    // If no specific IDs provided, get all approved emails ready to send
    if (emailIds.length === 0) {
      const { data: readyEmails } = await (supabase
        .from("outreach_emails")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "ready_to_send")
        .order("created_at", { ascending: true }) as unknown as Promise<{ data: { id: string }[] | null }>);

      if (!readyEmails || readyEmails.length === 0) {
        return NextResponse.json(
          { message: "No approved emails waiting in queue to send", total: 0, sent: 0 },
          { status: 200 }
        );
      }
      emailIds = readyEmails.map((e) => e.id);
    }

    let sentCount = 0;
    let failedCount = 0;
    let rateLimitHit = false;
    let stopReason: string | undefined = undefined;
    const sentResults: Array<{ id: string; status: string; error?: string }> = [];

    for (const id of emailIds) {
      // 1. Check rate limits before every dispatch
      const rateCheck = await canSendEmail(user.id);
      if (!rateCheck.canSend) {
        rateLimitHit = true;
        stopReason = rateCheck.reason;
        break;
      }

      // 2. Fetch email record
      const { data: emailRecord } = await (supabase
        .from("outreach_emails")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle() as unknown as Promise<{ data: any }>);

      if (!emailRecord) {
        failedCount++;
        sentResults.push({ id, status: "failed", error: "Email record not found" });
        continue;
      }

      try {
        // 3. Send through Gmail API
        const dispatch = await sendGmailEmail(user.id, {
          to: emailRecord.to_email,
          subject: emailRecord.subject,
          body: emailRecord.body,
        });

        // 4. Record sent & increment limits
        await recordEmailDispatched(user.id, id, dispatch.messageId, dispatch.threadId);

        sentCount++;
        sentResults.push({ id, status: "sent" });
      } catch (sendErr: any) {
        failedCount++;
        sentResults.push({ id, status: "failed", error: sendErr.message });
      }
    }

    const limits = await canSendEmail(user.id);

    return NextResponse.json({
      success: true,
      total_requested: emailIds.length,
      sent: sentCount,
      failed: failedCount,
      rate_limit_hit: rateLimitHit,
      stop_reason: stopReason,
      remaining_today: Math.max(0, limits.limits.daily_limit - limits.limits.emails_sent_today),
      remaining_this_hour: Math.max(0, limits.limits.hourly_limit - limits.limits.emails_sent_this_hour),
      results: sentResults,
    });
  } catch (error: any) {
    console.error("Batch send error:", error);
    return NextResponse.json(
      { error: error.message || "Batch send failed" },
      { status: 500 }
    );
  }
}
