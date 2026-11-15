import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Client chạy trong trình duyệt. Dùng cho các trang cần đăng nhập.
 * Biến môi trường được nhúng vào bundle, chỉ dùng publishable key.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
