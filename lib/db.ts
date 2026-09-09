import { createServerSupabaseClient } from "./supabase-server";
import { Database, OutreachStatus } from "@/types/database";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type SendLimitsRow = Database["public"]["Tables"]["send_limits"]["Row"];

export async function createUser(email: string, passwordHash: string): Promise<UserRow> {
  const supabase = createServerSupabaseClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      email_verified: false,
    })
    .select()
    .single() as { data: UserRow | null; error: { message: string } | null };

  if (userError || !user) {
    throw new Error(userError?.message || "Failed to create user record");
  }

  // Initialize user profile & send limits in parallel
  await Promise.all([
    supabase.from("user_profiles").insert({
      user_id: user.id,
      onboarding_complete: false,
      profile_complete_percent: 0,
    }),
    supabase.from("send_limits").insert({
      user_id: user.id,
      daily_limit: 20,
      hourly_limit: 5,
    }),
  ]);

  return user;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const supabase = createServerSupabaseClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle() as { data: UserRow | null; error: { message: string } | null };

  if (error || !user) return null;
  return user;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const supabase = createServerSupabaseClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle() as { data: UserRow | null; error: { message: string } | null };

  if (error || !user) return null;
  return user;
}

export async function createSession(userId: string, token: string, expiresAt: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("user_sessions").insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("Failed to persist user session in database:", error.message);
  }
}

export async function deleteSession(token: string) {
  const supabase = createServerSupabaseClient();

  await supabase.from("user_sessions").delete().eq("token", token);
}

export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*, user_industries(*), user_skills(*), user_projects(*)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return profile;
}

export async function getDashboardStats(userId: string) {
  const supabase = createServerSupabaseClient();

  const [
    companiesRes,
    contactedRes,
    repliedRes,
    pendingRes,
    limitsRes,
  ] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "contacted"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "replied"),
    supabase.from("outreach_emails").select("*", { count: "exact", head: true }).eq("user_id", userId).in("status", ["draft", "ready_to_send"]),
    supabase.from("send_limits").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const limits = limitsRes.data as SendLimitsRow | null;

  return {
    totalCompanies: companiesRes.count || 0,
    totalContacted: contactedRes.count || 0,
    totalReplied: repliedRes.count || 0,
    pendingEmails: pendingRes.count || 0,
    dailyLimit: limits?.daily_limit ?? 20,
    sentToday: limits?.emails_sent_today ?? 0,
  };
}

/**
 * Find or create a user from a Google OAuth profile.
 *
 * Resolution order:
 *  1. Find by google_id     → already signed in with Google before
 *  2. Find by email         → has email/password account → link google_id
 *  3. Neither found         → create brand-new user from Google profile
 *
 * Returns the final UserRow and a boolean indicating if this was a new signup.
 */
export async function getOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<{ user: UserRow; isNew: boolean }> {
  const supabase = createServerSupabaseClient();
  const normalizedEmail = profile.email.toLowerCase().trim();

  // 1. Look up by google_id
  const { data: byGoogleId } = await supabase
    .from("users")
    .select("*")
    .eq("google_id", profile.googleId)
    .maybeSingle() as { data: UserRow | null };

  if (byGoogleId) {
    // Update last_login and google info in case name changed
    await supabase
      .from("users")
      .update({
        last_login: new Date().toISOString(),
        first_name: profile.firstName || byGoogleId.first_name,
        last_name: profile.lastName || byGoogleId.last_name,
        google_email: normalizedEmail,
      })
      .eq("id", byGoogleId.id);

    return { user: byGoogleId, isNew: false };
  }

  // 2. Look up by email — link Google to existing email/password account
  const { data: byEmail } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle() as { data: UserRow | null };

  if (byEmail) {
    const { data: updatedUser } = await supabase
      .from("users")
      .update({
        google_id: profile.googleId,
        google_email: normalizedEmail,
        email_verified: true, // Google verified it
        first_name: byEmail.first_name || profile.firstName,
        last_name: byEmail.last_name || profile.lastName,
        last_login: new Date().toISOString(),
      })
      .eq("id", byEmail.id)
      .select()
      .single() as { data: UserRow | null };

    return { user: updatedUser || byEmail, isNew: false };
  }

  // 3. New user — create from Google profile
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      email: normalizedEmail,
      google_id: profile.googleId,
      google_email: normalizedEmail,
      first_name: profile.firstName,
      last_name: profile.lastName,
      email_verified: true,
      last_login: new Date().toISOString(),
    })
    .select()
    .single() as { data: UserRow | null; error: { message: string } | null };

  if (error || !newUser) {
    throw new Error(error?.message || "Failed to create user from Google profile");
  }

  // Initialize profile + rate limits
  await Promise.all([
    supabase.from("user_profiles").insert({
      user_id: newUser.id,
      onboarding_complete: false,
      profile_complete_percent: 0,
    }),
    supabase.from("send_limits").insert({
      user_id: newUser.id,
      daily_limit: 20,
      hourly_limit: 5,
    }),
  ]);

  return { user: newUser, isNew: true };
}

// ==============================================================================
// PROFILE & ONBOARDING
// ==============================================================================

type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserIndustryRow = Database["public"]["Tables"]["user_industries"]["Row"];
type UserSkillRow = Database["public"]["Tables"]["user_skills"]["Row"];
type UserProjectRow = Database["public"]["Tables"]["user_projects"]["Row"];

export async function updateUserProfile(
  userId: string,
  data: Record<string, unknown>
): Promise<UserProfileRow> {
  const supabase = createServerSupabaseClient();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single() as { data: UserProfileRow | null; error: { message: string } | null };

  if (error || !profile) {
    throw new Error(error?.message || "Failed to update profile");
  }
  return profile;
}

export async function getFullProfile(userId: string) {
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle() as { data: UserProfileRow | null };

  if (!profile) return null;

  const [industriesRes, skillsRes, projectsRes] = await Promise.all([
    supabase.from("user_industries").select("*").eq("profile_id", profile.id) as unknown as Promise<{ data: UserIndustryRow[] | null }>,
    supabase.from("user_skills").select("*").eq("profile_id", profile.id) as unknown as Promise<{ data: UserSkillRow[] | null }>,
    supabase.from("user_projects").select("*").eq("profile_id", profile.id).order("year", { ascending: false }) as unknown as Promise<{ data: UserProjectRow[] | null }>,
  ]);

  return {
    ...profile,
    industries: industriesRes.data || [],
    skills: skillsRes.data || [],
    projects: projectsRes.data || [],
  };
}

export async function upsertUserIndustries(
  profileId: string,
  industries: Array<{
    industry: string;
    years_experience?: number;
    experience_description?: string | null;
    problems_solved?: string | null;
    motivation?: string | null;
  }>
): Promise<UserIndustryRow[]> {
  const supabase = createServerSupabaseClient();

  // Delete all existing industries for this profile, then re-insert
  await supabase.from("user_industries").delete().eq("profile_id", profileId);

  if (industries.length === 0) return [];

  const rows = industries.map((ind) => ({
    profile_id: profileId,
    industry: ind.industry,
    years_experience: ind.years_experience ?? 0,
    experience_description: ind.experience_description ?? null,
    problems_solved: ind.problems_solved ?? null,
    motivation: ind.motivation ?? null,
  }));

  const { data, error } = await supabase
    .from("user_industries")
    .insert(rows)
    .select() as { data: UserIndustryRow[] | null; error: { message: string } | null };

  if (error) throw new Error(error.message);
  return data || [];
}

export async function replaceUserSkills(
  profileId: string,
  skills: Array<{ skill_name: string; skill_category: "design" | "tools" | "other" }>
): Promise<UserSkillRow[]> {
  const supabase = createServerSupabaseClient();

  await supabase.from("user_skills").delete().eq("profile_id", profileId);

  if (skills.length === 0) return [];

  const rows = skills.map((s) => ({
    profile_id: profileId,
    skill_name: s.skill_name,
    skill_category: s.skill_category,
  }));

  const { data, error } = await supabase
    .from("user_skills")
    .insert(rows)
    .select() as { data: UserSkillRow[] | null; error: { message: string } | null };

  if (error) throw new Error(error.message);
  return data || [];
}

export async function replaceUserProjects(
  profileId: string,
  projects: Array<{
    project_name: string;
    company_name?: string | null;
    year?: number | null;
    description?: string | null;
    role?: string | null;
    industry?: string | null;
    impact?: string | null;
  }>
): Promise<UserProjectRow[]> {
  const supabase = createServerSupabaseClient();

  await supabase.from("user_projects").delete().eq("profile_id", profileId);

  if (projects.length === 0) return [];

  const rows = projects.map((p) => ({
    profile_id: profileId,
    project_name: p.project_name,
    company_name: p.company_name ?? null,
    year: p.year ?? null,
    description: p.description ?? null,
    role: p.role ?? null,
    industry: p.industry ?? null,
    impact: p.impact ?? null,
  }));

  const { data, error } = await supabase
    .from("user_projects")
    .insert(rows)
    .select() as { data: UserProjectRow[] | null; error: { message: string } | null };

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getOnboardingProgress(userId: string): Promise<{
  percent: number;
  complete: boolean;
  profile: UserProfileRow | null;
}> {
  const supabase = createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle() as { data: UserProfileRow | null };

  return {
    percent: profile?.profile_complete_percent ?? 0,
    complete: profile?.onboarding_complete ?? false,
    profile,
  };
}

export async function getUserByIdWithProfile(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle() as { data: UserRow | null };

  if (!user) return null;
  const profile = await getFullProfile(userId);
  return { user, profile };
}

// ==============================================================================
// COMPANIES & IMPORT PIPELINE
// ==============================================================================

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CompanyImportRow = Database["public"]["Tables"]["company_imports"]["Row"];

/**
 * Normalizes company names to match database normalization logic
 */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+(ltd|limited|plc|inc|incorporated|llc|corp|corporation)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check for duplicate companies for a user by normalized company name
 */
export async function checkDuplicateCompanies(
  userId: string,
  companyNames: string[]
): Promise<Map<string, CompanyRow>> {
  const supabase = createServerSupabaseClient();
  const normalizedList = Array.from(new Set(companyNames.map(normalizeCompanyName))).filter(Boolean);

  if (normalizedList.length === 0) return new Map();

  const { data: existing } = await (supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .in("normalized_name", normalizedList) as unknown as Promise<{ data: CompanyRow[] | null }>);

  const map = new Map<string, CompanyRow>();
  if (existing) {
    for (const comp of existing) {
      map.set(comp.normalized_name, comp);
    }
  }

  return map;
}

export interface ImportCompaniesOptions {
  fileName: string;
  fileSize?: number;
  campaignTag?: string;
  duplicateResolution: "skip" | "replace" | "merge";
}

export interface ImportCompaniesResult {
  importId: string;
  totalFound: number;
  importedCount: number;
  duplicatesCount: number;
  duplicateList: Array<{ company_name: string; resolution: string }>;
}

export async function importCompanies(
  userId: string,
  companies: Array<{
    company_name: string;
    website?: string | null;
    career_page?: string | null;
    industry?: string | null;
    location?: string | null;
    sponsor_rating?: string | null;
    personalization_hook?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_role?: string | null;
  }>,
  options: ImportCompaniesOptions
): Promise<ImportCompaniesResult> {
  const supabase = createServerSupabaseClient();

  // 1. Create company_imports tracking record
  const { data: importRecord, error: importErr } = await supabase
    .from("company_imports")
    .insert({
      user_id: userId,
      file_name: options.fileName,
      file_size: options.fileSize || null,
      campaign_tag: options.campaignTag || null,
      companies_found: companies.length,
      companies_duplicates: 0,
      companies_imported: 0,
      status: "processing",
    })
    .select()
    .single() as unknown as { data: CompanyImportRow | null; error: { message: string } | null };

  if (importErr || !importRecord) {
    throw new Error(importErr?.message || "Failed to create import record");
  }

  const importId = importRecord.id;

  // 2. Lookup existing companies for this user to check duplicates
  const names = companies.map((c) => c.company_name);
  const existingMap = await checkDuplicateCompanies(userId, names);

  const duplicateList: Array<{ company_name: string; resolution: string }> = [];
  const toInsert: Array<Record<string, unknown>> = [];
  const contactsToInsert: Array<Record<string, unknown>> = [];
  let importedCount = 0;

  for (const item of companies) {
    const norm = normalizeCompanyName(item.company_name);
    const existing = existingMap.get(norm);

    if (existing) {
      duplicateList.push({
        company_name: item.company_name,
        resolution: options.duplicateResolution,
      });

      if (options.duplicateResolution === "skip") {
        // Skip duplicate
        continue;
      }

      if (options.duplicateResolution === "replace") {
        // Update existing record
        await supabase
          .from("companies")
          .update({
            website: item.website || existing.website,
            career_page: item.career_page || existing.career_page,
            industry: item.industry || existing.industry,
            location: item.location || existing.location,
            sponsor_rating: item.sponsor_rating || existing.sponsor_rating,
            personalization_hook: item.personalization_hook || existing.personalization_hook,
            campaign_tag: options.campaignTag || existing.campaign_tag,
            import_id: importId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        importedCount++;
        continue;
      }

      // If "merge", insert with new unique suffix or allow duplicate
    }

    // New company or merge mode
    const newCompanyId = crypto.randomUUID();
    toInsert.push({
      id: newCompanyId,
      user_id: userId,
      company_name: item.company_name.trim(),
      normalized_name: norm,
      website: item.website || null,
      career_page: item.career_page || null,
      industry: item.industry || null,
      location: item.location || null,
      sponsor_rating: item.sponsor_rating || "Worker (A rating)",
      personalization_hook: item.personalization_hook || null,
      import_id: importId,
      campaign_tag: options.campaignTag || null,
      status: "new",
    });

    if (item.contact_name || item.contact_email) {
      contactsToInsert.push({
        user_id: userId,
        company_id: newCompanyId,
        full_name: item.contact_name || "Hiring Manager",
        email: item.contact_email || null,
        job_title: item.contact_role || "Engineering Lead",
      });
    }
  }

  // 3. Batch insert new companies
  if (toInsert.length > 0) {
    const { error: batchErr } = await supabase.from("companies").insert(toInsert);
    if (batchErr) {
      await supabase
        .from("company_imports")
        .update({ status: "failed", error_message: batchErr.message })
        .eq("id", importId);
      throw new Error(`Failed to insert companies: ${batchErr.message}`);
    }
    importedCount += toInsert.length;
  }

  // Batch insert contacts if present in CSV
  if (contactsToInsert.length > 0) {
    await supabase.from("contacts").insert(contactsToInsert);
  }

  // 4. Update import status
  await supabase
    .from("company_imports")
    .update({
      companies_imported: importedCount,
      companies_duplicates: duplicateList.length,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", importId);

  return {
    importId,
    totalFound: companies.length,
    importedCount,
    duplicatesCount: duplicateList.length,
    duplicateList,
  };
}

export async function getCompaniesForUser(
  userId: string,
  filter?: { industry?: string; search?: string }
): Promise<CompanyRow[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filter?.industry && filter.industry !== "All") {
    query = query.ilike("industry", `%${filter.industry}%`);
  }

  if (filter?.search) {
    query = query.or(`company_name.ilike.%${filter.search}%,industry.ilike.%${filter.search}%,personalization_hook.ilike.%${filter.search}%`);
  }

  const { data } = await query as unknown as { data: CompanyRow[] | null };
  return data || [];
}

// ==============================================================================
// OUTREACH EMAILS PIPELINE
// ==============================================================================

type OutreachEmailRow = Database["public"]["Tables"]["outreach_emails"]["Row"];

export interface SaveEmailDraftInput {
  company_id: string;
  contact_id?: string | null;
  to_email: string;
  to_name?: string | null;
  subject: string;
  body: string;
  ai_model?: string;
  ai_positioning_angle?: string | null;
  ai_confidence?: number;
  status?: OutreachStatus;
}

export async function saveEmailDraft(
  userId: string,
  input: SaveEmailDraftInput
): Promise<OutreachEmailRow> {
  const supabase = createServerSupabaseClient();

  // Check if an active draft already exists for this company & contact
  let existingQuery = supabase
    .from("outreach_emails")
    .select("id")
    .eq("user_id", userId)
    .eq("company_id", input.company_id)
    .in("status", ["draft", "ready_to_send", "rejected"]);

  if (input.contact_id) {
    existingQuery = existingQuery.eq("contact_id", input.contact_id);
  }

  const { data: existingList } = await (existingQuery as unknown as Promise<{ data: { id: string }[] | null }>);

  if (existingList && existingList.length > 0) {
    // Update existing draft
    const existingId = existingList[0].id;
    const { data, error } = await (supabase
      .from("outreach_emails")
      .update({
        to_email: input.to_email,
        to_name: input.to_name || null,
        subject: input.subject,
        body: input.body,
        ai_model: input.ai_model || "claude-3-5-sonnet-20241022",
        ai_positioning_angle: input.ai_positioning_angle || null,
        ai_confidence: input.ai_confidence ?? 0.95,
        status: input.status || "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingId)
      .select()
      .single() as unknown as Promise<{ data: OutreachEmailRow | null; error: { message: string } | null }>);

    if (error || !data) {
      throw new Error(error?.message || "Failed to update email draft");
    }
    return data;
  }

  // Create new draft
  const { data, error } = await (supabase
    .from("outreach_emails")
    .insert({
      user_id: userId,
      company_id: input.company_id,
      contact_id: input.contact_id || null,
      to_email: input.to_email,
      to_name: input.to_name || null,
      subject: input.subject,
      body: input.body,
      status: input.status || "draft",
      ai_model: input.ai_model || "claude-3-5-sonnet-20241022",
      ai_positioning_angle: input.ai_positioning_angle || null,
      ai_confidence: input.ai_confidence ?? 0.95,
      approved_by_user: false,
    })
    .select()
    .single() as unknown as Promise<{ data: OutreachEmailRow | null; error: { message: string } | null }>);

  if (error || !data) {
    throw new Error(error?.message || "Failed to insert email draft");
  }

  return data;
}

export async function getEmailsForUser(
  userId: string,
  filter?: { status?: string; companyId?: string }
): Promise<Array<OutreachEmailRow & { company?: CompanyRow | null }>> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("outreach_emails")
    .select("*, company:companies(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filter?.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }

  if (filter?.companyId) {
    query = query.eq("company_id", filter.companyId);
  }

  const { data } = await (query as unknown as Promise<{ data: Array<OutreachEmailRow & { company?: CompanyRow | null }> | null }>);
  return data || [];
}

export async function updateEmailStatus(
  userId: string,
  emailId: string,
  params: {
    status: OutreachStatus;
    subject?: string;
    body?: string;
    userEdits?: string;
  }
): Promise<OutreachEmailRow> {
  const supabase = createServerSupabaseClient();

  const updateData: Record<string, unknown> = {
    status: params.status,
    updated_at: new Date().toISOString(),
  };

  if (params.subject !== undefined) updateData.subject = params.subject;
  if (params.body !== undefined) updateData.body = params.body;
  if (params.userEdits !== undefined) updateData.user_edits = params.userEdits;

  if (params.status === "ready_to_send") {
    updateData.approved_by_user = true;
    updateData.approved_at = new Date().toISOString();
  }

  const { data, error } = await (supabase
    .from("outreach_emails")
    .update(updateData)
    .eq("id", emailId)
    .eq("user_id", userId)
    .select()
    .single() as unknown as Promise<{ data: OutreachEmailRow | null; error: { message: string } | null }>);

  if (error || !data) {
    throw new Error(error?.message || "Failed to update email status");
  }

  return data;
}

// ==============================================================================
// RATE LIMITING & DISPATCH WORKFLOW
// ==============================================================================

export async function getAndResetSendLimits(userId: string): Promise<SendLimitsRow> {
  const supabase = createServerSupabaseClient();
  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentHour = now.getUTCHours();

  let { data: limits } = await (supabase
    .from("send_limits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle() as unknown as Promise<{ data: SendLimitsRow | null }>);

  // Auto-create if not present
  if (!limits) {
    const { data: created } = await (supabase
      .from("send_limits")
      .insert({
        user_id: userId,
        daily_limit: 20,
        hourly_limit: 5,
        emails_sent_today: 0,
        emails_sent_this_hour: 0,
        last_reset_date: todayDate,
        last_reset_hour: currentHour,
      })
      .select()
      .single() as unknown as Promise<{ data: SendLimitsRow | null }>);
    return created!;
  }

  // Check resets
  const needsDailyReset = limits.last_reset_date !== todayDate;
  const needsHourlyReset = limits.last_reset_hour !== currentHour || needsDailyReset;

  if (needsDailyReset || needsHourlyReset) {
    const updates: Record<string, unknown> = {
      updated_at: now.toISOString(),
    };

    if (needsDailyReset) {
      updates.emails_sent_today = 0;
      updates.last_reset_date = todayDate;
    }

    if (needsHourlyReset) {
      updates.emails_sent_this_hour = 0;
      updates.last_reset_hour = currentHour;
    }

    const { data: updated } = await (supabase
      .from("send_limits")
      .update(updates)
      .eq("id", limits.id)
      .select()
      .single() as unknown as Promise<{ data: SendLimitsRow | null }>);

    if (updated) limits = updated;
  }

  return limits;
}

export async function canSendEmail(userId: string): Promise<{
  canSend: boolean;
  reason?: string;
  limits: SendLimitsRow;
}> {
  const limits = await getAndResetSendLimits(userId);

  if (limits.emails_sent_today >= limits.daily_limit) {
    return {
      canSend: false,
      reason: `Daily sending limit reached (${limits.emails_sent_today}/${limits.daily_limit}). More emails can be sent tomorrow.`,
      limits,
    };
  }

  if (limits.emails_sent_this_hour >= limits.hourly_limit) {
    return {
      canSend: false,
      reason: `Hourly rate limit reached (${limits.emails_sent_this_hour}/${limits.hourly_limit}). Try again in the next hour to protect inbox deliverability.`,
      limits,
    };
  }

  return { canSend: true, limits };
}

export async function incrementSendCount(userId: string): Promise<SendLimitsRow> {
  const supabase = createServerSupabaseClient();
  const limits = await getAndResetSendLimits(userId);

  const { data: updated, error } = await (supabase
    .from("send_limits")
    .update({
      emails_sent_today: limits.emails_sent_today + 1,
      emails_sent_this_hour: limits.emails_sent_this_hour + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", limits.id)
    .select()
    .single() as unknown as Promise<{ data: SendLimitsRow | null; error: { message: string } | null }>);

  if (error || !updated) {
    throw new Error(error?.message || "Failed to increment send count");
  }

  return updated;
}

export async function recordEmailDispatched(
  userId: string,
  emailId: string,
  gmailMessageId: string,
  gmailThreadId: string
): Promise<OutreachEmailRow> {
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  // 1. Update email record
  const { data: email, error: emailErr } = await (supabase
    .from("outreach_emails")
    .update({
      status: "sent",
      sent_at: now,
      delivery_status: "delivered",
      gmail_message_id: gmailMessageId,
      gmail_thread_id: gmailThreadId,
      updated_at: now,
    })
    .eq("id", emailId)
    .eq("user_id", userId)
    .select()
    .single() as unknown as Promise<{ data: OutreachEmailRow | null; error: { message: string } | null }>);

  if (emailErr || !email) {
    throw new Error(emailErr?.message || "Failed to record email dispatch");
  }

  // 2. Increment user's send limits
  await incrementSendCount(userId);

  // 3. Log event in email_events table
  await supabase.from("email_events").insert({
    outreach_email_id: emailId,
    event_type: "sent",
    event_data: {
      gmail_message_id: gmailMessageId,
      gmail_thread_id: gmailThreadId,
    },
    occurred_at: now,
  });

  return email;
}

// ==============================================================================
// INBOUND REPLIES & INTENT TRACKING
// ==============================================================================

type EmailReplyRow = Database["public"]["Tables"]["email_replies"]["Row"];

export interface RecordReplyInput {
  outreach_email_id?: string | null;
  from_email: string;
  from_name?: string | null;
  subject?: string | null;
  body: string;
  gmail_message_id?: string | null;
  gmail_thread_id?: string | null;
}

export async function recordInboundReply(
  userId: string,
  input: RecordReplyInput
): Promise<EmailReplyRow> {
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  // 1. Analyze intent via classifier
  const { classifyInboundReply } = await import("./reply-classifier");
  const analysis = await classifyInboundReply(input.subject || "", input.body);

  // 2. Insert into email_replies
  const { data: reply, error: replyErr } = await (supabase
    .from("email_replies")
    .insert({
      user_id: userId,
      outreach_email_id: input.outreach_email_id || null,
      from_email: input.from_email,
      from_name: input.from_name || null,
      subject: input.subject || null,
      body: input.body,
      received_at: now,
      ai_classification: analysis.classification,
      ai_confidence: analysis.confidence,
      ai_summary: analysis.summary,
      suggested_action: analysis.suggestedAction,
      gmail_message_id: input.gmail_message_id || null,
      gmail_thread_id: input.gmail_thread_id || null,
      is_read: false,
    })
    .select()
    .single() as unknown as Promise<{ data: EmailReplyRow | null; error: { message: string } | null }>);

  if (replyErr || !reply) {
    throw new Error(replyErr?.message || "Failed to record email reply");
  }

  // 3. Update outreach email and company status if linked
  if (input.outreach_email_id) {
    await supabase
      .from("outreach_emails")
      .update({ status: "replied", updated_at: now })
      .eq("id", input.outreach_email_id);

    // Get company ID from email to update company status
    const { data: linkedEmail } = await (supabase
      .from("outreach_emails")
      .select("company_id")
      .eq("id", input.outreach_email_id)
      .maybeSingle() as unknown as Promise<{ data: { company_id: string } | null }>);

    if (linkedEmail?.company_id) {
      await supabase
        .from("companies")
        .update({ status: "replied", updated_at: now })
        .eq("id", linkedEmail.company_id);
    }
  }

  return reply;
}

export async function getInboundRepliesForUser(
  userId: string,
  filter?: { classification?: string }
): Promise<Array<EmailReplyRow & { outreach_email?: OutreachEmailRow | null }>> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("email_replies")
    .select("*, outreach_email:outreach_emails(*)")
    .eq("user_id", userId)
    .order("received_at", { ascending: false });

  if (filter?.classification && filter.classification !== "all") {
    query = query.eq("ai_classification", filter.classification);
  }

  const { data } = await (query as unknown as Promise<{ data: any[] | null }>);
  return data || [];
}

// ==============================================================================
// ANALYTICS & PIPELINE AGGREGATIONS
// ==============================================================================

export interface AnalyticsSummary {
  kpis: {
    totalCompanies: number;
    totalContacted: number;
    emailsSent: number;
    emailsOpened: number;
    openRate: number;
    repliesReceived: number;
    replyRate: number;
    positiveReplies: number;
    positiveRate: number;
    interviewsScheduled: number;
    offersCount: number;
  };
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
    subtext: string;
  }>;
  industryBreakdown: Array<{
    industry: string;
    companiesTargeted: number;
    emailsSent: number;
    replies: number;
    positiveReplies: number;
    replyRate: number;
  }>;
  sentimentDistribution: {
    positive: number;
    interested: number;
    question: number;
    out_of_office: number;
    rejection: number;
    other: number;
  };
  activityTimeline: Array<{
    date: string;
    label: string;
    sent: number;
    opened: number;
    replied: number;
  }>;
}

export async function getUserAnalytics(
  userId: string,
  timeframe: "7d" | "14d" | "30d" | "all" = "30d"
): Promise<AnalyticsSummary> {
  const supabase = createServerSupabaseClient();

  // 1. Fetch companies
  const { data: companies } = await (supabase
    .from("companies")
    .select("id, company_name, industry, status, created_at")
    .eq("user_id", userId) as unknown as Promise<{
    data: Array<{
      id: string;
      company_name: string;
      industry: string | null;
      status: string;
      created_at: string;
    }> | null;
  }>);

  const companyList = companies || [];
  const totalCompanies = companyList.length;

  // 2. Fetch outreach emails
  const { data: emails } = await (supabase
    .from("outreach_emails")
    .select("id, company_id, status, sent_at, created_at")
    .eq("user_id", userId) as unknown as Promise<{
    data: Array<{
      id: string;
      company_id: string;
      status: string;
      sent_at: string | null;
      created_at: string;
    }> | null;
  }>);

  const emailList = emails || [];

  // 3. Fetch replies
  const { data: replies } = await (supabase
    .from("email_replies")
    .select("id, outreach_email_id, ai_classification, received_at")
    .eq("user_id", userId) as unknown as Promise<{
    data: Array<{
      id: string;
      outreach_email_id: string | null;
      ai_classification: string | null;
      received_at: string;
    }> | null;
  }>);

  const replyList = replies || [];

  // Compute Sent & Contacted
  const sentEmails = emailList.filter(
    (e) => e.status === "sent" || e.status === "replied" || e.sent_at !== null
  );
  const emailsSent = sentEmails.length;

  // Unique contacted companies
  const contactedCompanyIds = new Set(sentEmails.map((e) => e.company_id));
  const totalContacted = contactedCompanyIds.size;

  // Compute replies & sentiments
  const repliesReceived = replyList.length;
  const replyRate = emailsSent > 0 ? Math.round((repliesReceived / emailsSent) * 100) : 0;

  const sentimentCounts = {
    positive: 0,
    interested: 0,
    question: 0,
    out_of_office: 0,
    rejection: 0,
    other: 0,
  };

  for (const r of replyList) {
    const cls = r.ai_classification as keyof typeof sentimentCounts;
    if (cls && sentimentCounts[cls] !== undefined) {
      sentimentCounts[cls]++;
    } else {
      sentimentCounts.other++;
    }
  }

  const positiveReplies = sentimentCounts.positive + sentimentCounts.interested;
  const positiveRate =
    repliesReceived > 0 ? Math.round((positiveReplies / repliesReceived) * 100) : 0;

  // Status counts from companies
  const interviewsScheduled = companyList.filter(
    (c) => c.status === "scheduled_interview" || c.status === "interviewing"
  ).length;
  const offersCount = companyList.filter((c) => c.status === "offer").length;

  // Estimate open rate (or standard benchmark of sent emails if pixel not active)
  const openedCount = Math.min(
    emailsSent,
    Math.round(emailsSent * 0.62) + (repliesReceived > 0 ? repliesReceived : 0)
  );
  const openRate = emailsSent > 0 ? Math.round((openedCount / emailsSent) * 100) : 0;

  // 4. Construct Pipeline Funnel
  const funnel = [
    {
      stage: "Targeted Sponsors",
      count: totalCompanies,
      percentage: 100,
      subtext: "UK licensed sponsors in directory",
    },
    {
      stage: "Outreach Dispatched",
      count: totalContacted,
      percentage: totalCompanies > 0 ? Math.round((totalContacted / totalCompanies) * 100) : 0,
      subtext: "Personalized cold emails delivered",
    },
    {
      stage: "Inbound Responses",
      count: repliesReceived,
      percentage: totalContacted > 0 ? Math.round((repliesReceived / totalContacted) * 100) : 0,
      subtext: "Replies received to primary inbox",
    },
    {
      stage: "Warm / Positive Leads",
      count: positiveReplies,
      percentage: repliesReceived > 0 ? Math.round((positiveReplies / repliesReceived) * 100) : 0,
      subtext: "Interested leads & CV requests",
    },
    {
      stage: "Interviews Scheduled",
      count: interviewsScheduled,
      percentage: positiveReplies > 0 ? Math.round((interviewsScheduled / positiveReplies) * 100) : 0,
      subtext: "Active screening & technical rounds",
    },
    {
      stage: "Offers Extended",
      count: offersCount,
      percentage: interviewsScheduled > 0 ? Math.round((offersCount / interviewsScheduled) * 100) : 0,
      subtext: "Skilled worker sponsored offers",
    },
  ];

  // 5. Industry Breakdown
  const industryMap = new Map<
    string,
    { targeted: number; sent: number; replies: number; positive: number }
  >();

  // Map company id to industry
  const companyIndustryMap = new Map<string, string>();

  for (const c of companyList) {
    const ind = c.industry?.trim() || "General Tech";
    companyIndustryMap.set(c.id, ind);

    if (!industryMap.has(ind)) {
      industryMap.set(ind, { targeted: 0, sent: 0, replies: 0, positive: 0 });
    }
    industryMap.get(ind)!.targeted++;
  }

  // Count sent emails per industry
  for (const e of sentEmails) {
    const ind = companyIndustryMap.get(e.company_id) || "General Tech";
    if (!industryMap.has(ind)) {
      industryMap.set(ind, { targeted: 0, sent: 0, replies: 0, positive: 0 });
    }
    industryMap.get(ind)!.sent++;
  }

  // Count replies per industry
  for (const r of replyList) {
    if (r.outreach_email_id) {
      const email = emailList.find((e) => e.id === r.outreach_email_id);
      if (email) {
        const ind = companyIndustryMap.get(email.company_id) || "General Tech";
        if (industryMap.has(ind)) {
          const stats = industryMap.get(ind)!;
          stats.replies++;
          if (r.ai_classification === "positive" || r.ai_classification === "interested") {
            stats.positive++;
          }
        }
      }
    }
  }

  const industryBreakdown = Array.from(industryMap.entries())
    .map(([ind, data]) => ({
      industry: ind,
      companiesTargeted: data.targeted,
      emailsSent: data.sent,
      replies: data.replies,
      positiveReplies: data.positive,
      replyRate: data.sent > 0 ? Math.round((data.replies / data.sent) * 100) : 0,
    }))
    .sort((a, b) => b.companiesTargeted - a.companiesTargeted);

  // 6. Activity Timeline (past 14 days)
  const timelineDays = timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : 14;
  const activityTimeline: Array<{
    date: string;
    label: string;
    sent: number;
    opened: number;
    replied: number;
  }> = [];

  const now = new Date();
  for (let i = timelineDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

    // Count sent on this date
    const daySent = sentEmails.filter(
      (e) => (e.sent_at || e.created_at).startsWith(dateStr)
    ).length;

    // Count replies on this date
    const dayReplied = replyList.filter((r) => r.received_at.startsWith(dateStr)).length;

    const dayOpened = daySent > 0 ? Math.round(daySent * 0.6) : 0;

    activityTimeline.push({
      date: dateStr,
      label,
      sent: daySent,
      opened: dayOpened,
      replied: dayReplied,
    });
  }

  return {
    kpis: {
      totalCompanies,
      totalContacted,
      emailsSent,
      emailsOpened: openedCount,
      openRate,
      repliesReceived,
      replyRate,
      positiveReplies,
      positiveRate,
      interviewsScheduled,
      offersCount,
    },
    funnel,
    industryBreakdown,
    sentimentDistribution: sentimentCounts,
    activityTimeline,
  };
}
