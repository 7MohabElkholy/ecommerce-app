import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for server-side administration.
 *
 * This client is configured for server-side use with administrative privileges.
 * It uses the Supabase service role key for authentication, which should be kept secret
 * and only used on the server.
 *
 * @property {object} auth - Authentication options for the Supabase client.
 * @property {boolean} auth.autoRefreshToken - Disables automatic token refreshing.
 * @property {boolean} auth.persistSession - Disables session persistence.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
