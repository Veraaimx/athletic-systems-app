import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

// Service-role client: bypasses RLS entirely. Reserved for admin/maintenance
// scripts (e.g. backfills) — never import this in a Route Handler that serves
// a signed-in user's request. Those use @/lib/supabase-server instead, so RLS
// enforces per-user isolation.
export const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
