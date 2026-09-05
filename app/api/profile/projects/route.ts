/**
 * POST /api/profile/projects — Replace user projects
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile, replaceUserProjects } from "@/lib/db";

const projectsSchema = z.object({
  projects: z.array(
    z.object({
      project_name: z.string().min(1, "Project name is required"),
      company_name: z.string().optional().nullable(),
      year: z.number().int().min(1990).max(2030).optional().nullable(),
      description: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
      industry: z.string().optional().nullable(),
      impact: z.string().optional().nullable(),
    })
  ).min(1, "At least 1 project is required"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = projectsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const profile = await getUserProfile(user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const projects = await replaceUserProjects(profile.id, parsed.data.projects);
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
