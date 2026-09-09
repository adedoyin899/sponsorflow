/**
 * POST /api/replies/simulate
 * Developer / testing endpoint that generates simulated incoming replies
 * to verify closed-loop reply detection and sentiment workflows.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { recordInboundReply } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const simulateSchema = z.object({
  outreach_email_id: z.string().uuid().optional(),
  type: z.enum(["positive", "interested", "rejection"]).default("positive"),
});

const SIMULATED_REPLIES = {
  positive: {
    subject: "Re: Design & Engineering roles / Let's chat next week",
    body: "Hi Doyin,\n\nThanks for reaching out! We've been looking to expand our product design capabilities on our core payments team. Your experience with multi-step flow friction reduction looks very relevant.\n\nCould you send over your latest CV and a link to your portfolio? Also let me know if you have 15 minutes for a quick introductory video call next Tuesday or Wednesday.\n\nBest regards,\nJane Smith\nVP of Product, ClearBank",
    from_name: "Jane Smith",
    from_email: "jane.smith@clear.bank",
  },
  interested: {
    subject: "Re: Intro & background",
    body: "Hi Doyin,\n\nThanks for reaching out and sharing your work. We don't currently have headcount open for senior design roles this quarter, but we really like your portfolio and focus on accessible fintech UX.\n\nWould it be alright if I keep your details on file and reach back out in 30–60 days when our Q4 hiring plan is finalized?\n\nCheers,\nAlex Rivera\nDesign Director, Canva",
    from_name: "Alex Rivera",
    from_email: "alex@canva.com",
  },
  rejection: {
    subject: "Re: Following up",
    body: "Hi Doyin,\n\nThank you for getting in touch and for your interest in our team. Unfortunately, we are not able to offer UK Skilled Worker sponsorship for our current open roles, so we will not be able to progress with your application at this time.\n\nWe wish you the very best in your job search.\n\nKind regards,\nRecruitment Team, Monzo",
    from_name: "Monzo Recruiting",
    from_email: "talent@monzo.com",
  },
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = simulateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { type, outreach_email_id } = parsed.data;
    const template = SIMULATED_REPLIES[type];

    let emailId = outreach_email_id;

    // If no email ID provided, try to find any sent or ready_to_send email
    if (!emailId) {
      const supabase = createServerSupabaseClient();
      const { data: anyEmail } = await (supabase
        .from("outreach_emails")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle() as unknown as Promise<{ data: { id: string } | null }>);

      if (anyEmail) emailId = anyEmail.id;
    }

    const reply = await recordInboundReply(user.id, {
      outreach_email_id: emailId || null,
      from_email: template.from_email,
      from_name: template.from_name,
      subject: template.subject,
      body: template.body,
      gmail_message_id: `sim_msg_${crypto.randomUUID().slice(0, 8)}`,
      gmail_thread_id: `sim_thread_${crypto.randomUUID().slice(0, 8)}`,
    });

    return NextResponse.json({
      success: true,
      message: `Simulated ${type} reply successfully created and classified!`,
      reply,
    });
  } catch (err: any) {
    console.error("Simulation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to simulate reply" },
      { status: 500 }
    );
  }
}
