import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// On server-side (API routes), use serviceRoleKey to bypass RLS for customer/sub checks
const effectiveKey =
  typeof window === "undefined" && serviceRoleKey
    ? serviceRoleKey
    : supabaseAnonKey;

export const supabase =
  supabaseUrl && effectiveKey
    ? createClient(supabaseUrl, effectiveKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

