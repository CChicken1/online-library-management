#!/usr/bin/env node
/**
 * Kiểm tra cấu hình Supabase và trạng thái schema trên dự án thật.
 *
 *   node scripts/check-supabase.mjs
 *
 * Script sẽ:
 *   1. Đọc .env.local / .env
 *   2. Gọi PostgREST để xác nhận khoá publishable/secret hoạt động
 *   3. Kiểm tra các bảng nghiệp vụ đã tồn tại hay chưa
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

// Supabase đã đổi tên khóa: anon key -> publishable key, service_role -> secret key.
// Ta đọc cả hai tên cho tương thích.
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishableKey =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const secretKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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

if (!publishableKey) {
  console.log("  ✗ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY chưa được đặt");
  ok = false;
} else {
  console.log(`  ✓ publishable key: ${publishableKey.slice(0, 18)}...`);
}

if (!secretKey) {
  console.log("  · secret key: chưa có (không bắt buộc để chạy app)");
} else {
  console.log(`  ✓ secret key: ${secretKey.slice(0, 18)}...`);
}

console.log("");

if (!ok) {
  console.log("Còn thiếu cấu hình. Làm theo các bước sau:\n");
  console.log("  1. Tạo project tại https://supabase.com/dashboard");
  console.log("  2. Vào Project Settings > API, lấy Project URL và publishable key");
  console.log("  3. Điền vào file .env.local trong thư mục gốc");
  console.log("  4. Chạy lại script này\n");
  process.exit(1);
}

// --- Kiểm tra schema trên dự án thật -----------------------------------
const TABLES = [
  "members",
  "books",
  "book_copies",
  "loans",
  "reservations",
  "fines",
  "audit_log",
  "library_settings",
];

const headers = {
  apikey: secretKey || publishableKey,
  Authorization: `Bearer ${secretKey || publishableKey}`,
};

console.log("Đang kiểm tra schema trên dự án…\n");

let missing = [];

for (const table of TABLES) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
  if (res.status === 404) {
    console.log(`  ✗ ${table}: chưa tồn tại`);
    missing.push(table);
  } else if (res.ok) {
    const body = await res.json();
    const n = Array.isArray(body) ? body.length : 0;
    console.log(`  ✓ ${table}: tồn tại${n ? ` (mẫu: ${n} dòng)` : ""}`);
  } else {
    console.log(`  ! ${table}: HTTP ${res.status} — ${(await res.text()).slice(0, 120)}`);
  }
}

console.log("");

if (missing.length) {
  console.log(`Còn thiếu ${missing.length} bảng. Chạy schema + dữ liệu mẫu:\n`);
  console.log("  1. Mở https://supabase.com/dashboard > SQL Editor > New query");
  console.log("  2. Dán toàn bộ nội dung file: supabase/setup-all.sql");
  console.log("  3. Bấm Run, đợi báo Success\n");
  console.log("  Sau đó cấp quyền thủ thư cho tài khoản đầu tiên:");
  console.log(
    "  update auth.users set raw_app_meta_data = " +
      "jsonb_set(raw_app_meta_data, '{role}', '\"librarian\"') " +
      "where email = 'email-cua-ban@example.com';",
  );
  console.log("");
  console.log("  Chi tiết: supabase/setup-all.sql và supabase/promote-librarian.sql");
  process.exit(1);
}

console.log("Schema đã đầy đủ. Tiếp theo:\n");
console.log("  1. Đăng ký tài khoản tại http://localhost:3000/join");
console.log("  2. Cấp quyền thủ thư bằng script promote-librarian.sql");
console.log("  3. Đăng nhập tại http://localhost:3000/login\n");
