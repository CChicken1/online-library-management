import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * App luôn cần phiên đăng nhập (đọc cookie ở mọi trang), nên toàn bộ route
   * là dynamic. Bật cacheComponents sẽ bắt buộc bọc mọi truy vấn dữ liệu vào
   * <Suspense>, vô ích cho trường hợp này.
   */
  cacheComponents: false,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
