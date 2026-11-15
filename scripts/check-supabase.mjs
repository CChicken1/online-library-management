#!/usr/bin/env node
/**
 * Kiểm tra cấu hình Supabase và hướng dẫn các bước còn thiếu.
 *
 *   node scripts/check-supabase.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = {
  ...loadEnv(join(root, ".env.local")),
  ...loadEnv(join(root, ".env")),
};

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

console.log("Sổ Mượn — kiểm tra cấu hình Supabase\n");

let ok = true;

if (!url) {
  console.log("  ✗ NEXT_PUBLIC_SUPABASE_URL chưa được đặt");
  ok = false;
} else if (url.includes("your-project-ref")) {
  console.log("  ✗ NEXT_PUBLIC_SUPABASE_URL vẫn là giá trị mẫu");
  ok = false;
} else {
  console.log(`  ✓ NEXT_PUBLIC_SUPABASE_URL: ${url}`);
}

if (!key) {
  console.log("  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được đặt");
  ok = false;
} else if (key.includes("your-anon-key")) {
  console.log("  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY vẫn là giá trị mẫu");
  ok = false;
} else {
  console.log(`  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key.slice(0, 12)}...`);
}

console.log("");

if (!ok) {
  console.log("Còn thiếu cấu hình. Làm theo các bước sau:\n");
  console.log("  1. Tạo project tại https://supabase.com/dashboard");
  console.log("  2. Vào Project Settings > API, lấy Project URL và anon public key");
  console.log("  3. Điền vào file .env.local trong thư mục gốc");
  console.log("  4. Chạy lại script này\n");
  process.exit(1);
}

console.log("Cấu hình đã đủ. Tiếp theo:\n");
console.log("  1. Chạy migration:");
console.log("     npx supabase link --project-ref <ref>");
console.log("     npx supabase db push");
console.log("  2. Cấp quyền thủ thư cho tài khoản đầu tiên.");
console.log("     Trong SQL Editor của Supabase, chạy:");
console.log(
  "     update auth.users set raw_app_meta_data = " +
    "jsonb_set(raw_app_meta_data, '{role}', '\"librarian\"') " +
    "where email = 'email-cua-ban@example.com';",
);
console.log("  3. Đăng nhập tại http://localhost:3000/login\n");