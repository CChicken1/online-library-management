/**
 * Validate các file SQL migration bằng PGlite (Postgres chạy trong WASM).
 *   node scripts/validate-sql.mjs
 *
 * PGlite không có sẵn extension `pgcrypto` / `citext` và không có publication
 * `supabase_realtime` (đó là riêng của Supabase). Ta thay bằng shim tương đương
 * để phần còn lại của script được kiểm tra đúng như trên Supabase.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FILES = [
  "supabase/migrations/202611150001_init_library.sql",
  "supabase/migrations/202611150002_seed_data.sql",
];

// --- Shim cho PGlite -----------------------------------------------------
const BOOTSTRAP = `
create schema if not exists auth;

-- Supabase có sẵn các role này; PGlite thì không.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $$;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_app_meta_data jsonb default '{}'::jsonb
);

create or replace function auth.uid() returns uuid language sql stable as $$
  select null::uuid
$$;

-- Thay thế extension citext bằng domain tương đương.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'citext') then
    create domain public.citext as text;
  end if;
end $$;

-- Publication rỗng để khối alter publication chạy được.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;
`;

/** Bỏ các câu lệnh phụ thuộc extension nền tảng của Supabase. */
function adapt(sql) {
  return sql
    .replace(/^\s*create extension[^;]*;\s*$/gim, "")
    .replace(
      /alter publication supabase_realtime add table[^;]*;/gim,
      "-- (bỏ qua trong PGlite)",
    );
}

const db = new PGlite();
await db.exec(BOOTSTRAP);

async function run(label, sql) {
  try {
    await db.exec(sql);
    console.log(`  OK   ${label}`);
    return true;
  } catch (e) {
    console.log(`  FAIL ${label}\n       ${e.message}`);
    return false;
  }
}

let allOk = true;

console.log("=== Áp dụng lần 1 ===");
for (const file of FILES) {
  const sql = adapt(readFileSync(join(root, file), "utf8"));
  allOk = (await run(file.split("/").pop(), sql)) && allOk;
}

console.log("\n=== Áp dụng lần 2 (idempotent) ===");
for (const file of FILES) {
  const sql = adapt(readFileSync(join(root, file), "utf8"));
  allOk = (await run(file.split("/").pop(), sql)) && allOk;
}

console.log("\n=== Kiểm tra dữ liệu ===");

const checks = [
  ["books", 10],
  ["book_copies", 48],
  ["members", 8],
  ["loans", 12],
  ["reservations", 3],
  ["fines", 3],
  ["library_settings", 1],
];
for (const [table, expected] of checks) {
  const r = await db.query(`select count(*)::int as n from public.${table}`);
  const n = r.rows[0].n;
  const ok = n === expected;
  console.log(`  ${ok ? "OK  " : "FAIL"} ${table}: ${n} dòng (kỳ vọng ${expected})`);
  if (!ok) allOk = false;
}

// Partial unique index: một bản vật lý không được mượn trùng
const dup = await db.query(`
  select copy_id, count(*)::int as n
  from public.loans
  where returned_on is null
  group by copy_id having count(*) > 1
`);
console.log(
  dup.rows.length === 0
    ? "  OK   không có bản vật lý nào bị mượn trùng"
    : `  FAIL trùng bản vật lý: ${JSON.stringify(dup.rows)}`,
);
if (dup.rows.length) allOk = false;

// Thử insert trùng để chắc partial unique index thực sự chặn
try {
  const victim = await db.query(`
    select copy_id, member_id, book_id from public.loans
    where returned_on is null limit 1
  `);
  const v = victim.rows[0];
  await db.query(
    `insert into public.loans (receipt_code, book_id, copy_id, member_id, due_on)
     values ('PM-TEST-DUP', $1, $2, $3, current_date)`,
    [v.book_id, v.copy_id, v.member_id],
  );
  console.log("  FAIL partial unique index KHÔNG chặn bản vật lý trùng");
  allOk = false;
} catch {
  console.log("  OK   partial unique index chặn đúng bản vật lý trùng");
}

// Loan phải trỏ tới bản vật lý có thật
const orphan = await db.query(`
  select count(*)::int as n from public.loans l
  where l.copy_id is not null
    and not exists (select 1 from public.book_copies c where c.id = l.copy_id)
`);
console.log(
  orphan.rows[0].n === 0
    ? "  OK   không có loan trỏ tới bản vật lý không tồn tại"
    : `  FAIL ${orphan.rows[0].n} loan trỏ sai bản vật lý`,
);
if (orphan.rows[0].n) allOk = false;

// Loan phải trỏ tới đầu sách đúng với bản vật lý
const mismatch = await db.query(`
  select count(*)::int as n from public.loans l
  join public.book_copies c on c.id = l.copy_id
  where c.book_id <> l.book_id
`);
console.log(
  mismatch.rows[0].n === 0
    ? "  OK   book_id của loan khớp với bản vật lý"
    : `  FAIL ${mismatch.rows[0].n} loan lệch đầu sách so với bản vật lý`,
);
if (mismatch.rows[0].n) allOk = false;

// View book_stock
const stock = await db.query(`
  select sum(total_copies)::int as total, sum(available_copies)::int as avail
  from public.book_stock
`);
console.log(
  `  View book_stock: ${stock.rows[0].total} bản, ${stock.rows[0].avail} sẵn có`,
);

// RLS + policy
const rls = await db.query(`
  select count(*)::int as n from pg_tables
  where schemaname = 'public' and rowsecurity
`);
console.log(`  RLS: ${rls.rows[0].n}/8 bảng bật row level security`);

const pol = await db.query(`
  select count(*)::int as n from pg_policies where schemaname = 'public'
`);
console.log(`  Policies: ${pol.rows[0].n}`);

// Số bản sẵn có từng đầu sách phải khớp prototype/books.html
const EXPECTED_STOCK = {
  "Bên kia sông": 0,
  "Nhà giả kim": 1,
  "Vườn thu": 7,
  "Chuyện của thiên tài": 3,
  "Sơn Tặng": 2,
  "Tôi thấy hoa vàng trên cỏ xanh": 4,
  "Lề thơ": 6,
  "Đại vệ chí dịch": 5,
  "Cho tôi mượn một lần": 1,
  "Tắt đèn": 9,
};
const stockRows = await db.query(`
  select title, total_copies, available_copies from public.book_stock order by title
`);
let stockOk = true;
for (const r of stockRows.rows) {
  const expected = EXPECTED_STOCK[r.title];
  if (expected === undefined) {
    console.log(`  ?    ${r.title}: không có trong danh sách kỳ vọng`);
    continue;
  }
  const ok = r.available_copies === expected;
  if (!ok) stockOk = false;
  console.log(
    `  ${ok ? "OK  " : "FAIL"} ${r.title}: ${r.available_copies}/${r.total_copies} sẵn có (kỳ vọng ${expected})`,
  );
}
allOk = stockOk && allOk;

// Hàm is_librarian tồn tại
const fn = await db.query(`
  select count(*)::int as n from pg_proc
  where proname = 'is_librarian'
`);
console.log(`  Hàm is_librarian: ${fn.rows[0].n > 0 ? "OK" : "THIẾU"}`);

console.log(allOk ? "\n==> Tất cả OK." : "\n==> Còn vấn đề, xem các dòng FAIL ở trên.");
await db.close();
process.exit(allOk ? 0 : 1);