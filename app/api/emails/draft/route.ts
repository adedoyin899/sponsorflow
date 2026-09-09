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
  company_id: z.string().min(1, "Invalid company ID"),
  contact_id: z.string().optional().nullable(),
});

const FALLBACK_COMPANIES = [
  { id: "1", company_name: "ClearBank", website: "https://clear.bank", industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Embedded clearing and payments infrastructure with real-time settlement rails." },
  { id: "2", company_name: "Canva", website: "https://canva.com", industry: "Design & SaaS", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Visual suite collaboration and generative AI design systems." },
  { id: "3", company_name: "Cloudflare", website: "https://cloudflare.com", industry: "Cloud Infrastructure", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Zero Trust edge security and developer serverless platform." },
  { id: "4", company_name: "Atlassian", website: "https://atlassian.com", industry: "Enterprise SaaS", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Jira & Confluence agile workflows and team velocity tooling." },
  { id: "5", company_name: "Monzo", website: "https://monzo.com", industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Consumer digital banking and transparent money management UX." },
  { id: "6", company_name: "Wise", website: "https://wise.com", industry: "Fintech", location: "London", sponsor_rating: "Worker (A rating)", personalization_hook: "Cross-border payments transparency and real-time currency exchange." },
];

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

    // 1. Fetch company from DB or fallback sample list
    let targetCompany: any = null;

    try {
      const { data: company } = await (supabase
        .from("companies")
        .select("*")
        .eq("id", company_id)
        .eq("user_id", user.id)
        .maybeSingle() as unknown as Promise<{ data: any; error: any }>);
      targetCompany = company;
    } catch {
      // Supabase lookup bypassed or failed
    }

    if (!targetCompany) {
      const sample = FALLBACK_COMPANIES.find((c) => c.id === company_id || c.company_name.toLowerCase() === company_id.toLowerCase());
      if (sample) {
        targetCompany = {
          id: sample.id,
          company_name: sample.company_name,
          website: sample.website,
          industry: sample.industry,
          sponsor_rating: sample.sponsor_rating,
          personalization_hook: sample.personalization_hook,
          status: "ready_to_send",
        };
      }
    }

    if (!targetCompany) {
      return NextResponse.json({ error: "Target company not found" }, { status: 404 });
    }

    const company = targetCompany;

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
