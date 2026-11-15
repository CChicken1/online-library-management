import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Rail, Topbar } from "@/components/shell";
import { getSettings } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

/**
 * Vỏ ứng dụng cho mọi trang cần đăng nhập.
 * Kiểm tra phiên, tải cấu hình thư viện, rồi dựng thanh trên và rail.
 */
export async function AppShell({
  children,
  panel,
}: {
  children: ReactNode;
  panel?: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const settings = await getSettings();

  return (
    <>
      <Topbar user={user as User} libraryName={settings.name} />
      <div className={panel ? "shell" : "shell no-panel"}>
        <Rail />
        <main className="center">{children}</main>
        {panel}
      </div>
    </>
  );
}
