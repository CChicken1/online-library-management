"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHead, Row, Rows, SectionTitle, Status, Tabs } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  FINE_PER_DAY,
  books,
  daysLate,
  formatDate,
  formatVNDFull,
  getBook,
  getMember,
  loans,
} from "@/lib/data";

type Filter = "active" | "overdue" | "returned";

export default function LoansPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const [q, setQ] = useState("");

  const active = loans.filter((l) => !l.returnedAt);
  const overdue = active.filter((l) => l.status === "overdue");

  const returned = loans.slice(0, 0); // dữ liệu trả sách sẽ nạp khi có API

  const list = useMemo(() => {
    const source =
      filter === "active" ? active : filter === "overdue" ? overdue : returned;
    const needle = q.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((l) => {
      const book = getBook(l.bookId);
      const member = getMember(l.memberId);
      return (
        l.id.toLowerCase().includes(needle) ||
        book?.title.toLowerCase().includes(needle) ||
        member?.name.toLowerCase().includes(needle)
      );
    });
  }, [filter, q, active, overdue, returned]);

  return (
    <>
      <Topbar />
      <div className="shell no-panel">
        <Rail />
        <main className="center">
          <PageHead
            title="Mượn & Trả"
            meta={`${active.length} phiếu đang mở, ${overdue.length} quá hạn`}
            actions={
              <>
                <button className="btn btn-quiet">Nhập trả tại chỗ</button>
                <Link className="btn" href="/loans/issue">
                  Tạo phiếu mượn
                </Link>
              </>
            }
          />

          <Tabs
            items={[
              { key: "active", label: "Đang mượn", count: active.length, active: filter === "active" },
              { key: "overdue", label: "Quá hạn", count: overdue.length, active: filter === "overdue" },
              { key: "returned", label: "Đã trả", active: filter === "returned" },
            ]}
            onChange={(k) => setFilter(k as Filter)}
          />

          <div className="fieldset">
            <label className="search-inline">
              <Search size={14} strokeWidth={2} aria-hidden />
              <input
                type="search"
                placeholder="Mã phiếu, tên sách, hội viên"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Tìm phiếu mượn"
              />
            </label>
          </div>

          <section className="section">
            <SectionTitle count={`${list.length} phiếu`}>
              {filter === "active"
                ? "Phiếu đang mở"
                : filter === "overdue"
                  ? "Phiếu quá hạn"
                  : "Phiếu đã trả"}
            </SectionTitle>

            {list.length === 0 ? (
              <p className="muted">
                {filter === "returned"
                  ? "Chưa có phiếu trả nào trong bộ dữ liệu hiện tại."
                  : "Không có phiếu nào khớp bộ lọc."}
              </p>
            ) : (
              <Rows>
                {list.map((l) => {
                  const book = getBook(l.bookId);
                  const member = getMember(l.memberId);
                  const late = l.status === "overdue";
                  const d = daysLate(l.dueAt);
                  return (
                    <Row key={l.id} className="loan">
                      <span className="no code">{l.id}</span>
                      <div>
                        <Link href={`/books/${l.bookId}`} className="title link">
                          {book?.title}
                        </Link>
                        <span className="sub">
                          {member?.name}, bản {l.copyLabel}
                        </span>
                      </div>
                      <span className="who code">
                        Hạn {formatDate(l.dueAt)}
                        {late ? (
                          <span className="sub late-sub">
                            trễ {d} ngày, {formatVNDFull(d * FINE_PER_DAY)}
                          </span>
                        ) : null}
                      </span>
                      <span className="who code">{member?.code}</span>
                      <Status tone={late ? "late" : "neutral"}>
                        {late ? "Quá hạn" : "Còn hạn"}
                      </Status>
                    </Row>
                  );
                })}
              </Rows>
            )}
          </section>

          <section className="section">
            <SectionTitle>Đến hạn trong 3 ngày tới</SectionTitle>
            <Rows>
              {active
                .filter((l) => {
                  const diff =
                    (new Date(l.dueAt).getTime() - new Date("2026-11-15").getTime()) /
                    86_400_000;
                  return diff >= 0 && diff <= 3;
                })
                .map((l) => {
                  const book = getBook(l.bookId);
                  const member = getMember(l.memberId);
                  return (
                    <Row key={l.id} className="c4">
                      <span className="no code">{l.copyLabel}</span>
                      <div>
                        <span className="title">{book?.title}</span>
                        <span className="sub">{member?.name}</span>
                      </div>
                      <span className="who code">{formatDate(l.dueAt)}</span>
                      <Status tone="neutral">Sắp đến hạn</Status>
                    </Row>
                  );
                })}
            </Rows>
          </section>
        </main>
      </div>
    </>
  );
}
