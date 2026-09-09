/**
 * POST /api/gmail/webhook
 * Receives Google Cloud Pub/Sub push notifications for incoming Gmail messages.
 */

import { NextResponse } from "next/server";
import { recordInboundReply } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Google Cloud Pub/Sub push message format: { message: { data: base64, messageId } }
    let rawData = "";
    if (body.message && body.message.data) {
      rawData = Buffer.from(body.message.data, "base64").toString("utf-8");
    }

    let parsedPayload: any = {};
    if (rawData) {
      try {
        parsedPayload = JSON.parse(rawData);
      } catch {
        parsedPayload = { text: rawData };
      }
    } else {
      parsedPayload = body;
    }

    const emailAddress = parsedPayload.emailAddress || body.emailAddress;
    const historyId = parsedPayload.historyId || body.historyId;

    // 2. Identify user by gmail_email
    if (emailAddress) {
      const supabase = createServerSupabaseClient();
      const { data: tokenRecord } = await (supabase
        .from("gmail_tokens")
        .select("user_id")
        .eq("gmail_email", emailAddress)
        .maybeSingle() as unknown as Promise<{ data: { user_id: string } | null }>);

      if (tokenRecord) {
        // In full production, this calls gmail.users.history.list using historyId.
        // For incoming push acknowledgments, we acknowledge 200 OK immediately:
        return NextResponse.json({
          received: true,
          userId: tokenRecord.user_id,
          historyId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Gmail webhook handling error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
