import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ENVIRONMENT_STRICT_MODE
const isStrict = process.env.ENVIRONMENT_STRICT_MODE === 'true';

if (isStrict) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("CONFIGURATION ERROR: Supabase Credentials Missing. Chronos System requires a live PostgreSQL connection for the Fraud Registry.");
  }
}

// Initializing with env variables directly
export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);
