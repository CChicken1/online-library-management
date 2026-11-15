/**
 * Đọc cấu hình Supabase từ biến môi trường.
 *
 * Supabase mới đổi tên khóa: `anon key` nay là `publishable key` (tiền tố
 * `sb_publishable_`), còn `service_role key` là `secret key` (tiền tố
 * `sb_secret_`). Ta chấp nhận cả tên cũ lẫn tên mới để không vỡ khi deploy.
 */

/** Project URL, ví dụ https://xxxx.supabase.co */
export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL. Xem .env.example để biết cách đặt.",
    );
  }
  return url;
}

/** Publishable key (anon key). Dùng phía client, an toàn để đưa lên trình duyệt. */
export function supabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return key;
}

/** Secret key (service role key). Chỉ dùng phía server cho việc quản trị. */
export function supabaseServiceRoleKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Thiếu SUPABASE_SECRET_KEY hoặc SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return key;
}
