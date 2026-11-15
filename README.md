# Sổ Mượn — giao diện quản lý thư viện

Ứng dụng Next.js cho thủ thư: mượn trả sách, quản lý hội viên, báo cáo lưu lượng.
Hiện chạy **hoàn toàn frontend**, dữ liệu là mock trong `src/lib/data.ts`.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
npm start        # chạy bản production
```

## Kiến trúc

```
src/
  app/
    layout.tsx            # font, metadata
    globals.css           # design tokens + toàn bộ style
    page.tsx              # Bàn làm việc (dashboard)
    books/page.tsx        # Kho sách
    books/[id]/page.tsx   # Chi tiết sách
    loans/page.tsx        # Mượn & Trả
    loans/issue/page.tsx  # Cho mượn (form 2 bước)
    members/page.tsx      # Hội viên
    reports/page.tsx      # Báo cáo
  components/
    shell.tsx             # Topbar + Rail điều hướng
    ui.tsx                # PageHead, SectionTitle, Counts, Rows, Status, Tabs, Field
  lib/
    data.ts               # mock data + hàm nghiệp vụ
prototype/                # bản HTML gốc, giữ làm tài liệu tham chiếu
```

## Hệ thiết kế

Bản gốc nằm ở `prototype/`, thiết kế đầy đủ trong `../design-plan.md`.
Nguyên tắc giữ nguyên khi chuyển sang React:

- **Token cứng, không dùng màu Tailwind mặc định.** Palette gồm 6 màu chính
  (`slate`, `stock`, `ink`, `graphite`, `stamp`, `catalogue`) cộng `rule` và `foxing`.
  Chỉ `stamp` dùng cho trễ hạn, chỉ `catalogue` dùng cho sẵn có.
- **Font:** Newsreader cho tiêu đề, Be Vietnam Pro cho giao diện, IBM Plex Mono cho mã
  Dewey, mã phiếu, số tiền.
- **Kẻ ngang thay cho card.** Không bo tròn tròn, không gradient, không đổ bóng mềm.
  Bán kính tối đa 2px.
- **Một yếu tố nổi bật duy nhất mỗi trang.** Trang chủ là "Kệ đang lưu hành":
  mỗi cuốn sách là một sống lưng, chiều cao là số ngày còn lại, son đỏ là quá hạn.
- Không dùng chữ in hoa làm nhãn, không dùng dấu chấm giữa `·`.

## Nối backend sau này

Toàn bộ giao diện đọc dữ liệu từ `src/lib/data.ts`. Khi có backend, chỉ cần:

1. Thêm `@supabase/supabase-js` và biến môi trường
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Tạo `src/lib/api.ts` trả về cùng kiểu dữ liệu (`Book`, `Member`, `Loan`...).
3. Đổi các trang từ import trực tiếp từ `@/lib/data` sang gọi API.

Kiểu dữ liệu trong `data.ts` là hợp đồng, giao diện không phải sửa theo.

Với Supabase, xác thực thủ thư nên dùng Supabase Auth + Row Level Security:
bảng `books`, `members`, `loans` chỉ cho `authenticated` role đọc/ghi.

## Lưu ý

`TODAY` trong `src/lib/data.ts` đóng vai "hôm nay" cho toàn bộ tính toán ngày
(hạn trả, trễ hạn, phí). Khi có backend, thay bằng ngày thực tế từ server.
