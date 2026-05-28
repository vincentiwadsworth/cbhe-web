/**
 * Supabase client initialization for CBHE certificate verification.
 *
 * Uses VITE_ prefixed env vars so Vite exposes them to client-side code.
 * The publishable key (sb_publishable_*) is safe to expose publicly — RLS policies restrict access.
 * Uses the new Supabase API key format (sb_publishable_ / sb_secret_*), not legacy anon/service_role JWTs.
 *
 * @example
 * ```ts
 * import { createSupabaseClient } from "../lib/supabase";
 * const supabase = createSupabaseClient();
 * const { data } = await supabase.from("certificados").select("*").eq("codigo", "CBHE-001");
 * ```
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return createClient(url, key);
}
