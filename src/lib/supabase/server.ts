import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Client chạy trên server (Server Components, Route Handlers, Server Actions).
 * Cookie phiên được đọc và ghi lại qua `cookies()`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ghi cookie bị chặn khi render tĩnh (Server Component).
            // Middleware đã lo phần này, nên bỏ qua ở đây là an toàn.
          }
        },
      },
    },
  );
}
