import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--fd",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--fs",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--fm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sổ Mượn — Quản lý thư viện",
  description:
    "Giao diện thủ thư cho quản lý thư viện: mượn trả sách, hội viên, báo cáo lưu lượng.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${newsreader.variable} ${beVietnamPro.variable} ${ibmPlexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
