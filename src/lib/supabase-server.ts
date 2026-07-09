import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars");
}

// Per-request client for Route Handlers and Server Components: carries the
// signed-in user's session (via cookies), so RLS policies apply to every
// query made through it. Use this instead of the service-role client
// (@/lib/supabase) anywhere a request needs to act as "the current user".
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(url as string, anonKey as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — the proxy already refreshes the
          // session cookie on the request/response, so this is safe to ignore.
        }
      },
    },
  });
}
