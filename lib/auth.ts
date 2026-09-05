import { createServerSupabaseClient } from "./supabase-server";

export async function getCurrentUser(userId?: string) {
  const supabase = createServerSupabaseClient();
  
  if (!userId) {
    return null;
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*, user_profiles(*)")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*, user_industries(*), user_skills(*), user_projects(*)")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return profile;
}
