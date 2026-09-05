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
