import { createServerSupabaseClient } from "./supabase-server";
import { Database } from "@/types/database";

type SendLimitsRow = Database["public"]["Tables"]["send_limits"]["Row"];

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
