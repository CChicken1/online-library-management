/**
 * Kiểm tra dữ liệu thực tế trên Supabase qua PostgREST.
 *   node scripts/check-data.mjs
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
const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
};

async function count(table, query = "") {
  const res = await fetch(`${base}/rest/v1/${table}?select=id${query}`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  if (!res.ok) return { n: -1, status: res.status };
  const cr = res.headers.get("content-range") ?? "";
  const n = Number(cr.split("/")[1] ?? 0);
  return { n };
}

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

console.log("Số dòng dữ liệu trên Supabase:\n");
for (const t of TABLES) {
  const { n, status } = await count(t);
  console.log(
    `  ${t}: ${n >= 0 ? `${n} dòng` : `lỗi HTTP ${status}`}`,
  );
}

// --- Kiểm tra view book_stock ---
console.log("\nSố bản sẵn có theo đầu sách:");
const stock = await fetch(`${base}/rest/v1/book_stock?select=title,total_copies,available_copies&order=title`, {
  headers,
});
if (stock.ok) {
  const rows = await stock.json();
  for (const r of rows) {
    console.log(`  ${r.title}: ${r.available_copies}/${r.total_copies}`);
  }
} else {
  console.log(`  lỗi HTTP ${stock.status}: ${(await stock.text()).slice(0, 200)}`);
}

// --- Phiếu mượn đang mở ---
console.log("\nPhiếu mượn chưa trả:");
const open = await fetch(
  `${base}/rest/v1/loans?select=receipt_code,borrowed_on,due_on,returned_on&returned_on=is.null&order=due_on`,
  { headers },
);
if (open.ok) {
  const rows = await open.json();
  for (const r of rows) {
    const late = Math.max(0, Math.round((Date.now() - new Date(r.due_on)) / 86400000));
    console.log(
      `  ${r.receipt_code}  mượn ${r.borrowed_on}  hạn ${r.due_on}${late > 0 ? `  TRỄ ${late} ngày` : ""}`,
    );
  }
  console.log(`  Tổng: ${rows.length} phiếu đang mở`);
}

// --- Cấu hình thư viện ---
const cfg = await fetch(`${base}/rest/v1/library_settings?select=*&id=eq.true`, {
  headers,
});
if (cfg.ok) {
  const s = (await cfg.json())[0];
  console.log(
    `\nCấu hình: ${s.name} | ${s.loan_days} ngày | phí ${s.fine_per_day}/ngày | gia hạn tối đa ${s.max_renewals}`,
  );
}

// --- Tài khoản auth ---
console.log("\nTài khoản đã đăng ký:");
const users = await fetch(`${base}/auth/v1/admin/users?per_page=50`, { headers });
if (users.ok) {
  const j = await users.json();
  if (!j.users?.length) {
    console.log("  (chưa có tài khoản nào — hãy đăng ký tại /join)");
  }
  for (const u of j.users ?? []) {
    const role = u.raw_app_meta_data?.role ?? "(chưa có quyền)";
    console.log(`  ${u.email} — role: ${role}`);
  }
} else {
  console.log(`  lỗi HTTP ${users.status}`);
}
