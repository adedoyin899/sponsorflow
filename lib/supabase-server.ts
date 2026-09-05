import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  // We use an untyped client here; all table operations in db.ts use explicit
  // Database type casts to maintain type safety without triggering Supabase's
  // strict generic resolution on manually authored Database types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}
