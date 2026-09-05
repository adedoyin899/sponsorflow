import { createServerSupabaseClient } from "./supabase-server";
import { Database } from "@/types/database";

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
