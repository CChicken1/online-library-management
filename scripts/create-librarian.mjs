/**
 * Tạo tài khoản thủ thư thật để test thủ công trên trình duyệt.
 *   node scripts/create-librarian.mjs <email> <mat-khau>
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

const base = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const password = process.argv[3] ?? "ThuThu123!";

if (!email) {
  console.log("Dùng: node scripts/create-librarian.mjs <email> [mat-khau]");
  process.exit(1);
}

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};

async function auth(path, options = {}) {
  const res = await fetch(`${base}/auth/v1/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* không phải JSON */
  }
  return { status: res.status, json, text };
}

const created = await auth("admin/users", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Thủ thư" },
  }),
});

let userId = created.json?.id;

if (!userId) {
  const list = await auth("admin/users?page=1&per_page=200");
  const found = list.json?.users?.find((u) => u.email === email);
  if (found) {
    userId = found.id;
    console.log(`Tài khoản đã tồn tại, dùng lại.`);
  } else {
    console.log("Lỗi tạo tài khoản:", created.text);
    process.exit(1);
  }
}

const promote = await auth(`admin/users/${userId}`, {
  method: "PUT",
  body: JSON.stringify({ app_metadata: { role: "librarian" } }),
});

if (promote.status < 300) {
  console.log(`Đã cấp quyền thủ thư cho ${email}`);
  console.log(`Mật khẩu: ${password}`);
  console.log(`Đăng nhập: http://localhost:3001/login`);
} else {
  console.log("Lỗi cấp quyền:", promote.text);
  process.exit(1);
}
