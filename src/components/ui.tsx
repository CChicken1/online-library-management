"use client";

import type { ReactNode } from "react";

/* ==========================================================================
   Các khối dùng chung cho toàn bộ màn hình.
   Nguyên tắc: kẻ ngang thay vì card. Không bo tròn, không gradient, không shadow.
   ========================================================================== */

/* ---------------- Tiêu đề trang ---------------- */

export function PageHead({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1 className="display">{title}</h1>
        {meta ? <p className="sub">{meta}</p> : null}
      </div>
      {actions ? <div className="actions">{actions}</div> : null}
    </div>
  );
}

/* ---------------- Tiêu đề section + đường kẻ ---------------- */

export function SectionTitle({
  children,
  count,
}: {
  children: ReactNode;
  count?: ReactNode;
}) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      <span className="section-line" />
      {count ? <span className="count">{count}</span> : null}
    </div>
  );
}

/* ---------------- Dãy số liệu, chia bằng đường kẻ ---------------- */

export function Counts({
  items,
  columns = 3,
}: {
  items: { n: string; label: string; alert?: boolean }[];
  columns?: 3 | 4;
}) {
  return (
    <div className={columns === 4 ? "counts counts-4" : "counts"}>
      {items.map((it) => (
        <div key={it.label}>
          <span className={it.alert ? "n alert" : "n"}>{it.n}</span>
          <span className="label">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Bảng kẻ ngang (ledger) ---------------- */

export function Rows({ children }: { children: ReactNode }) {
  return <div className="rows">{children}</div>;
}

export function Row({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={className ? `row ${className}` : "row"}>{children}</div>;
}

/* ---------------- Trạng thái ---------------- */

export type StatusTone = "ok" | "neutral" | "late";

const TONE_CLASS: Record<StatusTone, string> = {
  ok: "",
  neutral: "is-neutral",
  late: "is-late",
};

export function Status({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={TONE_CLASS[tone] ? `status ${TONE_CLASS[tone]}` : "status"}>
      <i aria-hidden />
      {children}
    </span>
  );
}

/* ---------------- Tabs gạch chân ---------------- */

export function Tabs({
  items,
  onChange,
}: {
  items: { key: string; label: string; count?: number; active?: boolean }[];
  onChange?: (key: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          role="tab"
          aria-selected={it.active || undefined}
          className="tab-btn"
          onClick={() => onChange?.(it.key)}
        >
          {it.label}
          {it.count !== undefined ? (
            <span className="tab-count">{it.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Ô nhập liệu ---------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

/* ---------------- Màn trống: lời mời hành động ---------------- */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

/* ---------------- Con dấu son đỏ (trễ hạn) ---------------- */

export function Stamp({ children }: { children: ReactNode }) {
  return <span className="stamp-block">{children}</span>;
}