import { createClient } from "@supabase/supabase-js";

const clean = (val?: string) => (val || "").trim().replace(/^["']|["']$/g, "");

const supabaseUrl = clean(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
);

const supabaseAnonKey = clean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY
);

const serviceRoleKey = clean(
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE
);

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

