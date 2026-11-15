-- ===========================================================================
-- Sổ Mượn — schema quản lý thư viện
-- Chạy trên Supabase Postgres.
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- 1. Bảng
-- ---------------------------------------------------------------------------

-- Hội viên: hồ sơ thẻ đọc, tách khỏi auth.users vì thẻ có thể cấp trước khi
-- người dùng tự đăng ký tài khoản trực tuyến.
create table if not exists public.members (
  id            uuid primary key default gen_random_uuid(),
  card_code     text not null unique,
  full_name     text not null,
  email         citext,
  phone         text,
  tier          text not null default 'Thường'
                check (tier in ('Thường', 'Vàng', 'Đọc tại chỗ')),
  max_books     integer not null default 5 check (max_books >= 0),
  joined_on     date not null default current_date,
  expires_on    date not null,
  status        text not null default 'active'
                check (status in ('active', 'suspended')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists members_name_idx  on public.members (full_name);
create index if not exists members_expires_idx on public.members (expires_on);

-- Sách: hồ sơ đầu sách, số bản vật lý ghi riêng ở book_copies.
create table if not exists public.books (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  title         text not null,
  author        text not null,
  subject       text not null,
  publisher     text,
  publish_year  integer,
  page_count    integer,
  shelf         text,
  keywords      text,
  summary       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists books_title_idx   on public.books (title);
create index if not exists books_subject_idx on public.books (subject);

-- Bản vật lý: mỗi dòng là một cuốn có thể cho mượn.
create table if not exists public.book_copies (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references public.books (id) on delete cascade,
  copy_label    text not null,
  acquired_on   date,
  condition     text not null default 'Tốt'
                check (condition in ('Tốt', 'Khá', 'Hư cần sửa', 'Hư')),
  unique (book_id, copy_label)
);

create index if not exists book_copies_book_idx on public.book_copies (book_id);

-- Phiếu mượn.
create table if not exists public.loans (
  id            uuid primary key default gen_random_uuid(),
  receipt_code  text not null unique,
  book_id       uuid not null references public.books (id),
  copy_id       uuid references public.book_copies (id),
  member_id     uuid not null references public.members (id),
  borrowed_on   date not null default current_date,
  due_on        date not null,
  returned_on   date,
  fine_amount   integer not null default 0 check (fine_amount >= 0),
  note          text,
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Một bản vật lý chỉ nằm trong một phiếu chưa trả tại một thời điểm.
-- Postgres không cho ràng buộc UNIQUE kèm điều kiện, nên dùng partial unique index.
create unique index if not exists one_open_loan_per_copy
  on public.loans (copy_id)
  where returned_on is null;

create index if not exists loans_member_idx on public.loans (member_id);
create index if not exists loans_book_idx   on public.loans (book_id);
create index if not exists loans_due_idx    on public.loans (due_on)
  where returned_on is null;

-- Đặt trước.
create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references public.books (id) on delete cascade,
  member_id     uuid not null references public.members (id) on delete cascade,
  reserved_on   date not null default current_date,
  status        text not null default 'waiting'
                check (status in ('waiting', 'ready', 'picked_up', 'cancelled')),
  created_at    timestamptz not null default now(),
  unique (book_id, member_id, status)
);

-- Thu phí trễ hạn.
create table if not exists public.fines (
  id            uuid primary key default gen_random_uuid(),
  loan_id       uuid references public.loans (id) on delete cascade,
  member_id     uuid not null references public.members (id),
  days_late     integer not null default 0 check (days_late >= 0),
  amount        integer not null default 0 check (amount >= 0),
  paid          boolean not null default false,
  paid_on       date,
  created_at    timestamptz not null default now()
);

create index if not exists fines_member_idx on public.fines (member_id);

-- Nhật ký thao tác, phục vụ đối chiếu khi có khiếu nại.
create table if not exists public.audit_log (
  id            bigint generated always as identity primary key,
  actor_id      uuid references auth.users (id),
  action        text not null,
  entity        text not null,
  entity_id     text,
  detail        jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Cấu hình thư viện (bảng 1 dòng)
-- ---------------------------------------------------------------------------

create table if not exists public.library_settings (
  id                boolean primary key default true check (id),
  name              text not null default 'Thư viện Trung tâm',
  loan_days         integer not null default 14 check (loan_days > 0),
  fine_per_day      integer not null default 17000 check (fine_per_day >= 0),
  max_renewals      integer not null default 1 check (max_renewals >= 0),
  updated_at        timestamptz not null default now()
);

insert into public.library_settings (id) values (true) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- 3. Hàm dùng chung
-- ---------------------------------------------------------------------------

-- Ngày hiện tại của thư viện. Cho phép override để test và để tính tới hạn.
create or replace function public.library_today()
returns date
language sql
stable
as $$ select current_date $$;

-- Số ngày trễ so với hôm nay, tối đa 0.
create or replace function public.days_late(due_on date)
returns integer
language sql
immutable
as $$
  select greatest(0, (public.library_today() - due_on)::integer)
$$;

-- Tự cập nhật updated_at.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists members_touch on public.members;
create trigger members_touch before update on public.members
  for each row execute function public.touch_updated_at();

drop trigger if exists books_touch on public.books;
create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();

drop trigger if exists loans_touch on public.loans;
create trigger loans_touch before update on public.loans
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4. View đọc: số bản sẵn có, số đang mượn
-- ---------------------------------------------------------------------------

create or replace view public.book_stock as
select
  b.id,
  b.code,
  b.title,
  b.author,
  b.subject,
  b.publisher,
  b.publish_year,
  b.page_count,
  b.shelf,
  b.keywords,
  b.summary,
  count(c.id)::int                          as total_copies,
  count(c.id) filter (where l.id is null)::int as available_copies
from public.books b
left join public.book_copies c on c.book_id = b.id
left join public.loans l
  on l.copy_id = c.id and l.returned_on is null
group by b.id;

-- ---------------------------------------------------------------------------
-- 5. RLS: chỉ thủ thư đã đăng nhập mới được truy cập
--    Tài khoản thường (đọc tại chỗ) không có quyền.
-- ---------------------------------------------------------------------------

alter table public.members          enable row level security;
alter table public.books            enable row level security;
alter table public.book_copies      enable row level security;
alter table public.loans            enable row level security;
alter table public.reservations     enable row level security;
alter table public.fines            enable row level security;
alter table public.audit_log        enable row level security;
alter table public.library_settings enable row level security;

create or replace function public.is_librarian()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and raw_app_meta_data ->> 'role' = 'librarian'
  )
$$;

grant execute on function public.is_librarian() to authenticated;

-- Thủ thư: toàn quyền trên bảng nghiệp vụ.
do $$
declare t text;
begin
  foreach t in array array[
    'members', 'books', 'book_copies', 'loans',
    'reservations', 'fines', 'audit_log', 'library_settings'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_librarian_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_librarian()) with check (public.is_librarian())',
      t || '_librarian_all', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Nối backend Supabase (REST), bảng cần đưa vào publication
-- ---------------------------------------------------------------------------

-- Cho phép chạy lại script nhiều lần mà không báo lỗi publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'loans'
  ) then
    alter publication supabase_realtime add table public.loans;
  end if;
end $$;
