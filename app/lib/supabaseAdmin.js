import { createClient } from "@supabase/supabase-js";

// This client is for server-side use only, with the service role key.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Important for server-side client
    autoRefreshToken: false,
    persistSession: false,
  },
});
