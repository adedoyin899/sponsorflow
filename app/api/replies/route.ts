/**
 * GET  /api/replies — Returns classified replies for authenticated user
 * POST /api/replies — Records a new inbound reply manually or via webhook
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getInboundRepliesForUser, recordInboundReply } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classification = searchParams.get("classification") || undefined;

  try {
    const replies = await getInboundRepliesForUser(user.id, { classification });
    return NextResponse.json({
      success: true,
      total: replies.length,
      replies,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch replies" },
      { status: 500 }
    );
  }
}

const manualReplySchema = z.object({
  outreach_email_id: z.string().min(1).optional(),
  from_email: z.string().email(),
  from_name: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = manualReplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const reply = await recordInboundReply(user.id, parsed.data);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to record reply" },
      { status: 500 }
    );
  }
}
