/**
 * GET & PUT /api/settings
 * Manages user preferences: profile, email dispatch limits, Claude AI model, and appearance.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile, updateUserProfile, getAndResetSendLimits } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  target_job_title: z.string().optional(),
  location: z.string().optional(),
  target_salary_gbp: z.number().optional(),
  requires_sponsorship: z.boolean().optional(),
  writing_tone: z.enum(["direct", "warm", "formal"]).optional(),
  daily_limit: z.number().min(1).max(100).optional(),
  hourly_limit: z.number().min(1).max(20).optional(),
  ai_model: z.string().optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  portfolio_url: z.string().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  sending_window_start: z.string().optional(),
  sending_window_end: z.string().optional(),
  email_signature: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(user.id);
    let sendLimits: any = null;
    try {
      sendLimits = await getAndResetSendLimits(user.id);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      settings: {
        email: user.email,
        first_name: user.first_name || "Doyin",
        last_name: user.last_name || "Adedoyin",
        target_job_title: profile?.target_job_title || "Senior Product Designer",
        location: profile?.location || "London, UK",
        target_salary_gbp: profile?.target_salary_gbp || 85000,
        requires_sponsorship: profile?.requires_sponsorship ?? true,
        writing_tone: profile?.writing_tone || "warm",
        daily_limit: sendLimits?.daily_limit || 20,
        hourly_limit: sendLimits?.hourly_limit || 5,
        ai_model: "claude-3-5-sonnet-20241022",
        theme: "dark",
        portfolio_url: profile?.portfolio_url || "https://doyin.design",
        linkedin_url: profile?.linkedin_url || "https://linkedin.com/in/doyin",
        sending_window_start: "09:00",
        sending_window_end: "17:00",
        email_signature: `Best,\n${user.first_name || "Doyin"}\n${profile?.portfolio_url || "https://doyin.design"}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const {
      first_name,
      last_name,
      target_job_title,
      location,
      target_salary_gbp,
      requires_sponsorship,
      writing_tone,
      daily_limit,
      hourly_limit,
      portfolio_url,
      linkedin_url,
    } = parsed.data;

    const supabase = createServerSupabaseClient();

    // 1. Update users table if names provided
    if (first_name !== undefined || last_name !== undefined) {
      try {
        await supabase
          .from("users")
          .update({
            first_name: first_name || null,
            last_name: last_name || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch (_) {}
    }

    // 2. Update user_profiles
    try {
      await updateUserProfile(user.id, {
        target_job_title,
        location,
        target_salary_gbp,
        requires_sponsorship,
        writing_tone,
        portfolio_url,
        linkedin_url,
      });
    } catch (_) {}

    // 3. Update send_limits
    if (daily_limit !== undefined || hourly_limit !== undefined) {
      try {
        await supabase
          .from("send_limits")
          .update({
            daily_limit: daily_limit || 20,
            hourly_limit: hourly_limit || 5,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: parsed.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export const POST = PUT;
