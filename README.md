# Sổ Mượn — quản lý thư viện

Ứng dụng Next.js + Supabase cho thủ thư: mượn trả sách, quản lý hội viên,
báo cáo lưu lượng.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
npm start        # chạy bản production
```

## Thiết lập Supabase

### 1. Tạo project

https://supabase.com/dashboard → New project.

### 2. Lấy khóa API

Project Settings → API → lấy **Project URL** và **anon public key**.

Tạo file `.env.local` ở thư mục gốc:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Kiểm tra: `npm run check:supabase`

### 3. Chạy migration

Có 2 file trong `supabase/migrations/`:

| File | Nội dung |
|---|---|
| `202611150001_init_library.sql` | Bảng, view, RLS, hàm |
| `202611150002_seed_data.sql` | Dữ liệu mẫu khớp với bản prototype |

Cách 1, dùng Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <ref-của-bạn>
npm run db:push
```

Cách 2, không dùng CLI: mở SQL Editor trong Dashboard, dán nội dung file thứ nhất
rồi chạy, sau đó dán file thứ hai rồi chạy.

### 4. Cấp quyền thủ thư

Mọi bảng đều bật RLS, chỉ tài khoản có `role = librarian` mới truy cập được.

1. Đăng ký tài khoản tại `http://localhost:3000/join`.
2. Mở SQL Editor, chạy nội dung trong `supabase/promote-librarian.sql` (thay email
   của bạn).
3. Đăng nhập tại `http://localhost:3000/login`.

Tài khoản chưa được cấp quyền vẫn đăng nhập được nhưng sẽ không thấy dữ liệu.

### 5. Tắt xác nhận email (tuỳ chọn)

Authentication → Sign In / Providers → Email → bỏ chọn **Confirm email**, để
đăng ký và đăng nhập tức thì trong môi trường phát triển.

## Kiến trúc

```
src/
  app/
    layout.tsx              # font, metadata
    globals.css             # design tokens + toàn bộ style
    page.tsx                # Bàn làm việc (dashboard)
    login/page.tsx          # Đăng nhập
    join/page.tsx           # Đăng ký thủ thư
    actions.ts              # server actions: mượn, trả, gia hạn, thẻ, phí
    books/page.tsx          # Kho sách
    books/[id]/page.tsx     # Chi tiết sách
    loans/page.tsx          # Mượn & Trả
    loans/issue/page.tsx    # Cho mượn (server)
    loans/issue/issue-form.tsx  # Cho mượn (client)
    members/page.tsx        # Hội viên
    members/new/            # Cấp thẻ mới
    members/[id]/page.tsx   # Chi tiết hội viên
    reports/page.tsx        # Báo cáo
  components/
    app-shell.tsx           # vỏ ứng dụng, kiểm tra phiên
    shell.tsx               # Topbar + Rail điều hướng
    ui.tsx                  # PageHead, SectionTitle, Counts, Rows, Status, Field
    loan-actions.tsx        # nút Trả / Gia hạn
  lib/
    api.ts                  # TOÀN BỘ truy vấn Supabase nằm ở đây
    types.ts                # kiểu dữ liệu dùng chung + hàm thuần khiết
    index-helpers.ts        # tra cứu nhanh theo id
    supabase/
      client.ts             # browser client
      server.ts             # server client (đọc cookie phiên)
      database.types.ts     # kiểu Postgres, sinh từ schema
  proxy.ts                  # bảo vệ route, làm mới phiên
supabase/
  migrations/               # SQL cho schema và dữ liệu mẫu
  promote-librarian.sql     # cấp quyền thủ thư
prototype/                  # bản HTML gốc, giữ làm tài liệu tham chiếu
```

## Nguyên tắc phân lớp

- **Giao diện không biết Supabase tồn tại.** Trang chỉ gọi hàm trong `lib/api.ts`
  hoặc server action trong `app/actions.ts`.
- **Mọi truy vấn nằm trong `lib/api.ts`.** Đổi nguồn dữ liệu, cấu trúc bảng, hay
  thêm caching đều không đụng vào giao diện.
- **Kiểm tra nghiệp vụ nằm ở server.** `issueLoan` kiểm tra hạn thẻ, hạn mức,
  bản vật lý còn trong kệ, sách trễ hạn chưa thu phí, trước khi ghi. Phía client
  chỉ hiển thị trước cho nhanh.
- **Ghi dữ liệu qua server action.** Mọi thao tác ghi đều `revalidatePath` để dữ
  liệu trên trang luôn mới.

## Schema

| Bảng | Vai trò |
|---|---|
| `members` | Hồ sơ thẻ đọc |
| `books` | Đầu sách |
| `book_copies` | Bản vật lý, mỗi dòng một cuốn cho mượn |
| `loans` | Phiếu mượn |
| `reservations` | Đặt trước |
| `fines` | Phí trễ hạn |
| `audit_log` | Nhật ký thao tác |
| `library_settings` | Cấu hình: số ngày mượn, phí mỗi ngày |

View `book_stock` gộp số bản tổng và số bản sẵn có, dùng cho danh mục.

Ràng buộc quan trọng:

- `loans` có unique partial `(copy_id) where returned_on is null`: một bản vật lý
  không thể nằm trong hai phiếu chưa trả.
- `library_settings` là bảng 1 dòng, số ngày mượn và đơn giá phí cấu hình được
  từ database thay vì hard-code.

## Hệ thiết kế

Bản gốc ở `prototype/`, thiết kế đầy đủ ở `../design-plan.md`. Giữ nguyên khi
chuyển sang React:

- **Token cứng, không dùng màu Tailwind mặc định.** Palette gồm 6 màu chính
  (`slate`, `stock`, `ink`, `graphite`, `stamp`, `catalogue`) cộng `rule` và `foxing`.
  Chỉ `stamp` dùng cho trễ hạn, chỉ `catalogue` dùng cho sẵn có.
- **Font:** Newsreader cho tiêu đề, Be Vietnam Pro cho giao diện, IBM Plex Mono cho mã
  kho, mã phiếu, số tiền.
- **Kẻ ngang thay cho card.** Không bo tròn tròn, không gradient, không đổ bóng mềm.
  Bán kính tối đa 2px.
- **Một yếu tố nổi bật duy nhất mỗi trang.** Trang chủ là "Kệ đang lưu hành":
  mỗi cuốn sách là một sống lưng, chiều cao là số ngày còn lại, son đỏ là quá hạn.
- Không dùng chữ in hoa làm nhãn, không dùng dấu chấm giữa `·`.

## Deploy lên Vercel

```bash
vercel
```

Thêm biến môi trường trong Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Không đặt `SUPABASE_SERVICE_ROLE_KEY` lên Vercel. Ứng dụng không dùng service
role: mọi truy vấn đi qua anon key và bị giới hạn bởi RLS.

## Bảo mật

- RLS bật trên toàn bộ bảng, policy `is_librarian()` kiểm tra
  `raw_app_meta_data.role = 'librarian'` trong `auth.users`.
- `is_librarian()` là `security definer` và `set search_path = public` để không bị
  đụng `search_path` của người gọi.
- `auth.uid()` được dùng để ghi `created_by` và `actor_id`, không nhận từ client.
- Mã phiếu sinh ở server, không nhận từ form.
