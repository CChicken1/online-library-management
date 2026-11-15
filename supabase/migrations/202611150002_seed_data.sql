-- ===========================================================================
-- Dữ liệu mẫu, khớp với mock data ở src/lib/data.ts
-- Chạy sau 202611150001_init_library.sql
-- ===========================================================================

-- --- Cấu hình ---
update public.library_settings
set name = 'Thư viện Trung tâm',
    loan_days = 14,
    fine_per_day = 17000,
    max_renewals = 1
where id = true;

-- --- Sách ---
insert into public.books (id, code, title, author, subject, publisher, publish_year, page_count, shelf, keywords, summary)
values
('11111111-1111-4111-8111-000000000001', '8432-B', 'Bên kia sông', 'Nguyễn Quang Thiều', 'Văn học', 'NXB Văn học', 1987, 312, 'Khoang 3, tầng 2', 'chiến tranh, nông thôn, đời thường',
 'Câu chuyện bắt đầu từ một ngôi làng ven sông, nơi người dân sống bằng nghề làm ruộng và đánh cá. Tác giả đưa người đọc đi qua mùa lũ, mùa đói, và những đổi thay của một gia đình bình thường trong ba thế hệ.

Văn phong giản dị, giàu chất thơ, với những đoạn tả cảnh sông và đồng lúa được viết bằng ngôn ngữ miền trung. Đây là tác phẩm tiêu biểu của dòng văn học miền Nam thập niên 1980.'),

('11111111-1111-4111-8111-000000000002', '1913-D', 'Nhà giả kim', 'Paulo Coelho', 'Văn học', 'NXB Lao động', 1994, 208, 'Khoang 3, tầng 2', 'hành trình, giấc mơ, số phận',
 'Cậu bé Santiago nghề nghiệp trẻ tìm được một cuốn sách cổ, trong đó có bí mật về vận mệnh. Cuốn sách dẫn cậu đi qua Tây Ban Nha, chợ tang, sa mạc Sahara, nơi cậu gặp những người thay đổi cách nhìn về cuộc đời.

Tác phẩm được dịch ra hơn 80 ngôn ngữ, nằm trong nhóm bán chạy nhất mọi thời đại.'),

('11111111-1111-4111-8111-000000000003', '2001-A', 'Vườn thu', 'Nguyễn Ngọc Tư', 'Văn học', 'NXB Văn học', 1965, 186, 'Khoang 1, tầng 1', 'nông thôn, tình yêu, xã hội',
 'Truyện ngắn về cuộc đời của cô Hà, một nữ công nhân ở nông trường. Cả tác phẩm được viết bằng giọng văn trong trẻo, tràn đầy sự tử tế, với những mối quan hệ giản dị mà sâu lắng giữa người lao động nông nghiệp và cán bộ công nhân.'),

('11111111-1111-4111-8111-000000000004', '4471-E', 'Chuyện của thiên tài', 'Hector Malot', 'Thiếu nhi', 'NXB Kim Đồng', 1984, 340, 'Khoang 7, tầng 3', 'trẻ em, nghèo khó, hy vọng',
 'Cậu bé Rémi bị bỏ rơi ở ngoại ô Paris, phải tự kiếm ăn và học cách sống giữa những người xa lạ. Câu chuyện xoay quanh tình yêu thương gia đình, tình bạn và sự kiên trì trong những hoàn cảnh khắc nghiệt.'),

('11111111-1111-4111-8111-000000000005', '1556-C', 'Sơn Tặng', 'Vũ Hoàng Chương', 'Văn học', 'NXB Văn học', 1989, 224, 'Khoang 3, tầng 2', 'đô thị, văn minh, xung đột',
 'Một tác phẩm về không gian đô thị Hà Nội những năm 1980, nơi những giá trị truyền thống va chạm với nhịp sống mới. Văn phong sắc bén, giàu chất thơ và đầy tính thời sự.'),

('11111111-1111-4111-8111-000000000006', '7412-F', 'Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Ngọc Tư', 'Văn học', 'NXB Văn học', 1976, 272, 'Khoang 1, tầng 1', 'học sinh, tình bạn, thành phố',
 'Chuyện của những đứa học sinh làng quê vào thành phố học, xa nhà lần đầu tiên. Những nỗi nhớ, nỗi buồn tách lìa và những tình bạn mới nối lên từ năm tháng thành phố.'),

('11111111-1111-4111-8111-000000000007', '5120-B', 'Lề thơ', 'Trần Dần', 'Văn học', 'NXB Văn học', 1991, 198, 'Khoang 3, tầng 2', 'hiện đại, trải nghiệm, đời sống',
 'Tập truyện ngắn về những nhân vật đang tìm chỗ đứng trong đời sống đô thị mới. Văn phong gọn, nhiều chi tiết bất ngờ, đôi khi gay gắt.'),

('11111111-1111-4111-8111-000000000008', '6308-A', 'Đại vệ chí dịch', 'Hà Giang', 'Lịch sử', 'NXB Đại học Quốc gia', 1998, 420, 'Khoang 7, tầng 3', 'lịch sử, ngoại giao, thế kỷ 19',
 'Ghi chép về hoạt động ngoại giao Việt Nam trong bối cảnh thế giới thế kỷ 19, khi mọi thứ đang định hình lại. Cuốn sách dựa trên nhiều tư liệu lưu trữ chưa được công bố.'),

('11111111-1111-4111-8111-000000000009', '3087-C', 'Cho tôi mượn một lần', 'Hà Giang', 'Văn học', 'NXB Văn học', 2001, 176, 'Khoang 3, tầng 2', 'đô thị, cô đơn, ký ức',
 'Những mảnh trải rời về cuộc sống của những người trẻ ở một thành phố đang thay đổi nhanh. Mỗi chuyện là một khoảnh khắc nhỏ soi ra một đời sống lớn.'),

('11111111-1111-4111-8111-000000000010', '9215-D', 'Tắt đèn', 'Nguyễn Quang Thiều', 'Văn học', 'NXB Văn học', 1992, 158, 'Khoang 1, tầng 1', 'làng quê, đời sống, thay đổi',
 'Trong một đêm mất điện ở ngôi làng, mười mấy người kể lại những chuyện của cuộc đời mình. Cuốn sách nhỏ nhưng nặng trĩu tình.')
on conflict (id) do nothing;

-- --- Bản vật lý: nhãn A1, A2, A3 tương ứng số bản của từng đầu sách ---
insert into public.book_copies (id, book_id, copy_label, acquired_on, condition)
select
  (('22222222-2222-4222-8222-' || lpad((row_number() over ())::text, 12, '0'))::uuid),
  b.id,
  lbl.label,
  date '2024-01-15',
  'Tốt'
from public.books b
cross join lateral (
  values ('A1'), ('A2'), ('A3')
) as lbl(label)
where b.id in (
  '11111111-1111-4111-8111-000000000001',
  '11111111-1111-4111-8111-000000000002',
  '11111111-1111-4111-8111-000000000003',
  '11111111-1111-4111-8111-000000000004',
  '11111111-1111-4111-8111-000000000005',
  '11111111-1111-4111-8111-000000000006',
  '11111111-1111-4111-8111-000000000007'
)
on conflict do nothing;

-- Nhà giả kim có 5 bản, Sơn Tặng 3, Chuyện của thiên tài 4, Tôi thấy hoa vàng 6,
-- Lề thơ 7, Đại vệ chí dịch 6, Cho tôi mượn 4, Tắt đèn 5, Vườn thu 8.
insert into public.book_copies (id, book_id, copy_label, acquired_on, condition)
select
  (('33333333-3333-4333-8333-' || lpad((row_number() over ())::text, 12, '0'))::uuid),
  b.id,
  'A' || n,
  date '2024-01-15',
  'Tốt'
from public.books b
cross join lateral generate_series(1, b_copies.n) as n
cross join lateral (select case b.id
    when '11111111-1111-4111-8111-000000000002' then 5
    when '11111111-1111-4111-8111-000000000004' then 4
    when '11111111-1111-4111-8111-000000000006' then 6
    when '11111111-1111-4111-8111-000000000007' then 7
    when '11111111-1111-4111-8111-000000000008' then 6
    when '11111111-1111-4111-8111-000000000009' then 4
    when '11111111-1111-4111-8111-000000000010' then 5
    when '11111111-1111-4111-8111-000000000003' then 8
  end) as b_copies(n)
where b.id in (
  '11111111-1111-4111-8111-000000000002',
  '11111111-1111-4111-8111-000000000003',
  '11111111-1111-4111-8111-000000000004',
  '11111111-1111-4111-8111-000000000006',
  '11111111-1111-4111-8111-000000000007',
  '11111111-1111-4111-8111-000000000008',
  '11111111-1111-4111-8111-000000000009',
  '11111111-1111-4111-8111-000000000010'
)
on conflict do nothing;

-- Vườn thu đã có A1..A3 ở khối trên, chỉ thêm B1..B5.
insert into public.book_copies (id, book_id, copy_label, acquired_on, condition)
select
  (('44444444-4444-4444-8444-' || lpad((row_number() over ())::text, 12, '0'))::uuid),
  b.id,
  'B' || n,
  date '2024-01-15',
  'Tốt'
from public.books b
cross join lateral generate_series(1, 5) as n
where b.id = '11111111-1111-4111-8111-000000000003'
on conflict do nothing;

-- --- Hội viên ---
insert into public.members (id, card_code, full_name, email, phone, tier, max_books, joined_on, expires_on, status)
values
('55555555-5555-4555-8555-000000000001', '0382', 'Trần Minh Quân', 'quan.tm@example.com', '090 214 5566', 'Thường', 5, date '2024-04-30', date '2027-04-30', 'active'),
('55555555-5555-4555-8555-000000000002', '1904', 'Nguyễn Thị Lan', 'lan.nt@example.com', '091 883 2210', 'Thường', 5, date '2023-11-30', date '2026-11-30', 'active'),
('55555555-5555-4555-8555-000000000003', '0557', 'Lê Thu Hà', 'ha.lt@example.com', '098 445 1102', 'Vàng', 8, date '2024-08-12', date '2027-08-12', 'active'),
('55555555-5555-4555-8555-000000000004', '2011', 'Phạm Anh Khoa', 'khoa.pa@example.com', '093 776 8890', 'Thường', 5, date '2024-12-08', date '2026-12-08', 'active'),
('55555555-5555-4555-8555-000000000005', '1663', 'Vũ Mai Chi', 'chi.vm@example.com', '035 220 7714', 'Đọc tại chỗ', 0, date '2025-01-22', date '2027-01-22', 'active'),
('55555555-5555-4555-8555-000000000006', '2448', 'Hoàng Gia Bảo', 'bao.hg@example.com', '089 112 3345', 'Thường', 5, date '2025-03-05', date '2027-03-05', 'active'),
('55555555-5555-4555-8555-000000000007', '0876', 'Nguyễn Văn Hùng', 'hung.nv@example.com', '096 634 5521', 'Thường', 5, date '2024-09-17', date '2026-09-17', 'active'),
('55555555-5555-4555-8555-000000000008', '1229', 'Đỗ Thu Trang', 'trang.dt@example.com', '090 998 4471', 'Vàng', 8, date '2024-12-14', date '2026-12-14', 'active')
on conflict (id) do nothing;

-- --- Phiếu mượn ---
-- Bản vật lý được tham chiếu bằng (book_id, copy_label).
insert into public.loans (id, receipt_code, book_id, copy_id, member_id, borrowed_on, due_on, returned_on, fine_amount)
select
  (('66666666-6666-4666-8666-' || lpad((row_number() over ())::text, 12, '0'))::uuid),
  v.receipt_code,
  v.book_id::uuid,
  (select c.id from public.book_copies c
     where c.book_id = v.book_id::uuid and c.copy_label = v.copy_label),
  v.member_id::uuid,
  v.borrowed_on::date,
  v.due_on::date,
  v.returned_on::date,
  v.fine_amount
from (values
  ('PM-2026-1026-084', '11111111-1111-4111-8111-000000000002', 'A1', '55555555-5555-4555-8555-000000000001', '2026-10-26', '2026-11-09', null, 102000),
  ('PM-2026-1021-117', '11111111-1111-4111-8111-000000000001', 'A2', '55555555-5555-4555-8555-000000000007', '2026-10-21', '2026-11-04', null, 187000),
  ('PM-2026-1108-203', '11111111-1111-4111-8111-000000000003', 'B1', '55555555-5555-4555-8555-000000000004', '2026-11-04', '2026-11-18', null, 0),
  ('PM-2026-1106-244', '11111111-1111-4111-8111-000000000004', 'A3', '55555555-5555-4555-8555-000000000008', '2026-11-06', '2026-11-24', null, 0),
  ('PM-2026-1108-271', '11111111-1111-4111-8111-000000000005', 'A1', '55555555-5555-4555-8555-000000000005', '2026-11-08', '2026-11-26', null, 0),
  ('PM-2026-1109-289', '11111111-1111-4111-8111-000000000006', 'B2', '55555555-5555-4555-8555-000000000006', '2026-11-09', '2026-11-27', null, 0),
  ('PM-2026-1105-302', '11111111-1111-4111-8111-000000000007', 'A1', '55555555-5555-4555-8555-000000000003', '2026-11-05', '2026-11-19', null, 0),
  ('PM-2026-1101-215', '11111111-1111-4111-8111-000000000003', 'A1', '55555555-5555-4555-8555-000000000002', '2026-11-01', '2026-11-15', '2026-11-12', 0),
  ('PM-2026-1028-176', '11111111-1111-4111-8111-000000000009', 'A1', '55555555-5555-4555-8555-000000000008', '2026-10-28', '2026-11-11', '2026-11-13', 34000)
) as v(receipt_code, book_id, copy_label, member_id, borrowed_on, due_on, returned_on, fine_amount)
on conflict do nothing;

-- --- Đặt trước ---
insert into public.reservations (book_id, member_id, reserved_on, status)
values
('11111111-1111-4111-8111-000000000001', '55555555-5555-4555-8555-000000000004', date '2026-11-10', 'waiting'),
('11111111-1111-4111-8111-000000000002', '55555555-5555-4555-8555-000000000008', date '2026-11-11', 'waiting'),
('11111111-1111-4111-8111-000000000001', '55555555-5555-4555-8555-000000000002', date '2026-11-12', 'waiting')
on conflict do nothing;

-- --- Phí trễ hạn ---
insert into public.fines (member_id, days_late, amount, paid)
values
('55555555-5555-4555-8555-000000000007', 11, 187000, false),
('55555555-5555-4555-8555-000000000001', 6, 102000, false),
('55555555-5555-4555-8555-000000000008', 4, 68000, false)
on conflict do nothing;
