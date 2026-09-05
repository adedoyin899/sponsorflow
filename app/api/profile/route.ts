/**
 * GET  /api/profile    — Get authenticated user's full profile
 * PUT  /api/profile    — Update profile fields (any step data)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getFullProfile, updateUserProfile } from "@/lib/db";

// Profile update schema — all fields optional, step-by-step saves
const profileUpdateSchema = z.object({
  // Step 2 — Basic Info
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  location: z.string().optional(),
  years_experience: z.number().int().min(0).max(50).optional(),
  target_job_title: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  // Step 6 — Sponsorship
  requires_sponsorship: z.boolean().optional(),
  target_salary_gbp: z.number().int().min(0).optional(),
  availability: z.string().optional(),
  remote_preference: z.string().optional(),
  // Step 9 — Story
  professional_summary: z.string().optional(),
  design_philosophy: z.string().optional(),
  unique_thing: z.string().optional(),
  writing_tone: z.enum(["direct", "warm", "formal"]).optional(),
  // Progress tracking
  profile_complete_percent: z.number().int().min(0).max(100).optional(),
  onboarding_complete: z.boolean().optional(),
  // Step 2 — current role
  current_company: z.string().optional(),
  current_role: z.string().optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getFullProfile(user.id);
  return NextResponse.json({ success: true, profile });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    // Split user table fields from profile table fields
    const { first_name, last_name, ...profileData } = parsed.data;

    // Update users table name if provided
    if (first_name || last_name) {
      const { createServerSupabaseClient } = await import("@/lib/supabase-server");
      const supabase = createServerSupabaseClient();
      await supabase.from("users").update({ first_name, last_name }).eq("id", user.id);
    }

    const profile = await updateUserProfile(user.id, profileData);
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
