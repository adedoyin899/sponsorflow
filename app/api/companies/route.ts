/**
 * GET  /api/companies — Get list of companies for the authenticated user
 * POST /api/companies — Create a single company manually
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getCompaniesForUser, normalizeCompanyName } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const companies = await getCompaniesForUser(user.id, { industry, search });
    return NextResponse.json({
      success: true,
      total: companies.length,
      companies,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

const createCompanySchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  website: z.string().url().optional().or(z.literal("")),
  career_page: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  location: z.string().optional(),
  sponsor_rating: z.string().optional(),
  personalization_hook: z.string().optional(),
  campaign_tag: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createCompanySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { company_name, ...rest } = parsed.data;
    const norm = normalizeCompanyName(company_name);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        company_name: company_name.trim(),
        normalized_name: norm,
        website: rest.website || null,
        career_page: rest.career_page || null,
        industry: rest.industry || null,
        location: rest.location || null,
        sponsor_rating: rest.sponsor_rating || "Worker (A rating)",
        personalization_hook: rest.personalization_hook || null,
        campaign_tag: rest.campaign_tag || null,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, company: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create company" },
      { status: 500 }
    );
  }
}
