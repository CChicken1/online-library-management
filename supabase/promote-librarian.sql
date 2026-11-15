-- ===========================================================================
-- Cấp quyền thủ thư cho một tài khoản.
--
-- Cách dùng:
--   1. Đăng ký tài khoản qua trang /join trước.
--   2. Mở SQL Editor trong Supabase Dashboard, dán và chạy câu lệnh dưới,
--      thay email-cua-ban@example.com bằng email của bạn.
-- ===========================================================================

update auth.users
set raw_app_meta_data = jsonb_set(
  coalesce(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"librarian"'::jsonb
)
where email = 'email-cua-ban@example.com';

-- Kiểm tra tài khoản đã được cấp quyền:
-- select email, raw_app_meta_data ->> 'role' as role
-- from auth.users
-- order by created_at desc;

-- Cấp quyền cho nhiều tài khoản cùng lúc:
-- update auth.users
-- set raw_app_meta_data = jsonb_set(
--   coalesce(raw_app_meta_data, '{}'::jsonb),
--   '{role}',
--   '"librarian"'::jsonb
-- )
-- where email in ('a@example.com', 'b@example.com');