/**
 * POST /api/profile/skills — Replace user skill set
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile, replaceUserSkills } from "@/lib/db";

const skillsSchema = z.object({
  skills: z.array(
    z.object({
      skill_name: z.string().min(1),
      skill_category: z.enum(["design", "tools", "other"]),
    })
  ).min(3, "At least 3 skills are required"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = skillsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const profile = await getUserProfile(user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const skills = await replaceUserSkills(profile.id, parsed.data.skills);
    return NextResponse.json({ success: true, skills });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
