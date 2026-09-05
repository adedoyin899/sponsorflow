/**
 * POST /api/profile/industries — Upsert all industry positioning data
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile, upsertUserIndustries } from "@/lib/db";

const industrySchema = z.object({
  industries: z.array(
    z.object({
      industry: z.string().min(1),
      years_experience: z.number().int().min(0).optional(),
      experience_description: z.string().optional().nullable(),
      problems_solved: z.string().optional().nullable(),
      motivation: z.string().optional().nullable(),
    })
  ).min(1, "At least one industry is required"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = industrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const profile = await getUserProfile(user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const industries = await upsertUserIndustries(profile.id, parsed.data.industries);
    return NextResponse.json({ success: true, industries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
