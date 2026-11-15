import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Client chạy trong trình duyệt. Dùng cho các trang cần đăng nhập.
 * Biến môi trường được nhúng vào bundle, chỉ dùng anon key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
