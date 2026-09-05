/**
 * POST /api/emails/draft — Generates personalized cold email using Claude AI
 *
 * Combines candidate positioning with company personalization hooks,
 * generates a tailored cold email draft, and saves it to outreach_emails.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getFullProfile, saveEmailDraft } from "@/lib/db";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  generatePersonalizedEmail,
  CandidateContext,
  CompanyTargetContext,
} from "@/lib/claude";

const draftRequestSchema = z.object({
  company_id: z.string().uuid("Invalid company ID"),
  contact_id: z.string().uuid().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = draftRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid request payload" },
        { status: 400 }
      );
    }

    const { company_id, contact_id } = parsed.data;
    const supabase = createServerSupabaseClient();

    // 1. Fetch company
    const { data: company, error: companyErr } = await (supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .eq("user_id", user.id)
      .maybeSingle() as unknown as Promise<{ data: any; error: any }>);

    if (companyErr || !company) {
      return NextResponse.json({ error: "Target company not found" }, { status: 404 });
    }

    // 2. Fetch contact if provided, or lookup any contact associated with this company
    let contactName = "Hiring Manager";
    let contactRole = "Engineering / Design Lead";
    let toEmail = `talent@${company.website ? company.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "company.com"}`;

    if (contact_id) {
      const { data: contact } = await (supabase
        .from("contacts")
        .select("*")
        .eq("id", contact_id)
        .eq("user_id", user.id)
        .maybeSingle() as unknown as Promise<{ data: any }>);

      if (contact) {
        contactName = contact.full_name;
        contactRole = contact.job_title || contactRole;
        if (contact.email) toEmail = contact.email;
      }
    } else {
      const { data: contacts } = await (supabase
        .from("contacts")
        .select("*")
        .eq("company_id", company_id)
        .eq("user_id", user.id)
        .limit(1) as unknown as Promise<{ data: any[] | null }>);

      if (contacts && contacts.length > 0) {
        contactName = contacts[0].full_name;
        contactRole = contacts[0].job_title || contactRole;
        if (contacts[0].email) toEmail = contacts[0].email;
      }
    }

    // 3. Fetch candidate's complete profile
    const profile = await getFullProfile(user.id);

    const candidateContext: CandidateContext = {
      firstName: user.first_name || "Doyin",
      lastName: user.last_name || undefined,
      targetRole: profile?.target_job_title || "Senior Product Designer",
      yearsExperience: profile?.years_experience || 6,
      location: profile?.location || "London, UK",
      requiresSponsorship: profile?.requires_sponsorship ?? true,
      targetSalary: profile?.target_salary_gbp || 85000,
      professionalSummary: profile?.professional_summary || undefined,
      writingTone: profile?.writing_tone || "warm",
      linkedinUrl: profile?.linkedin_url || undefined,
      portfolioUrl: profile?.portfolio_url || undefined,
      industries: profile?.industries || [],
      skills: profile?.skills?.map((s) => s.skill_name) || [],
      projects: profile?.projects || [],
    };

    const companyContext: CompanyTargetContext = {
      companyName: company.company_name,
      website: company.website,
      industry: company.industry,
      sponsorRating: company.sponsor_rating,
      personalizationHook: company.personalization_hook,
      contactName,
      contactRole,
    };

    // 4. Generate email via Claude API
    const generated = await generatePersonalizedEmail(candidateContext, companyContext);

    // 5. Persist draft to outreach_emails
    const savedEmail = await saveEmailDraft(user.id, {
      company_id,
      contact_id: contact_id || null,
      to_email: toEmail,
      to_name: contactName,
      subject: generated.subject,
      body: generated.body,
      ai_model: generated.model,
      ai_positioning_angle: generated.positioningAngle,
      ai_confidence: generated.confidence,
      status: "draft",
    });

    return NextResponse.json({
      success: true,
      email: savedEmail,
      company,
      word_count: generated.wordCount,
      confidence: generated.confidence,
      positioning_angle: generated.positioningAngle,
      model: generated.model,
    });
  } catch (error: any) {
    console.error("Error drafting email with Claude:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate email draft" },
      { status: 500 }
    );
  }
}
