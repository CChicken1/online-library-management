"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Bell,
  BookMarked,
  Search,
  Settings,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Sách", icon: BookOpen },
  { href: "/loans", label: "Mượn & Trả", icon: BookMarked },
  { href: "/members", label: "Hội viên", icon: Users },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
];

/* ---------------- Thanh điều hướng dọc ---------------- */

export function Rail() {
  const pathname = usePathname();

  return (
    <nav className="rail" aria-label="Điều hướng chính">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={active ? "is-active" : undefined}
          >
            <Icon size={19} strokeWidth={1.5} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
      <div className="spacer" />
      <Link href="#">
        <Settings size={19} strokeWidth={1.5} aria-hidden />
        <span>Cài đặt</span>
      </Link>
    </nav>
  );
}

/* ---------------- Thanh trên cùng ---------------- */

export function Topbar() {
  return (
    <header className="topbar">
      <div className="wordmark">
        Sổ <b>Mượn</b>
      </div>
      <div className="brand-sub">Thư viện Trung tâm</div>

      <label className="search">
        <Search size={14} strokeWidth={2} aria-hidden />
        <span>Tìm sách, hội viên, phiếu mượn</span>
        <kbd>/</kbd>
      </label>

      <button className="icon-btn" title="Thông báo" aria-label="Thông báo">
        <Bell size={17} strokeWidth={1.6} aria-hidden />
      </button>
      <div className="avatar" title="Thủ thư Trần Thanh">
        TT
      </div>
    </header>
  );
}
