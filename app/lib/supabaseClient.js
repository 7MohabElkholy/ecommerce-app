import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

/**
 * Creates a Supabase client for use in the browser.
 *
 * This client is safe to use in a browser environment and relies on the anonymous
 * public key for authentication.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} A Supabase client instance.
 */
export const supabase = createBrowserSupabaseClient();
