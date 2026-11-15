import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Làm mới phiếu đăng nhập và bảo vệ các route cần thủ thư.
 *
 * - `/login`, `/join` và các tài nguyên tĩnh: đi qua.
 * - Các route còn lại: bắt buộc đã đăng nhập, nếu không chuyển về `/login`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const PUBLIC = ["/login", "/join"];
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Không gọi getUser() ở route công khai để tiết kiệm một vòng gọi mạng.
  if (isPublic) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Bỏ qua các đường dẫn không cần middleware:
     * - _next/static, _next/image: tài nguyên build
     * - favicon.ico và file trong public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
