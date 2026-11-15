"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import { SUBJECTS, books, loans } from "@/lib/data";

const PER_PAGE = 6;

export default function BooksPage() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [shelf, setShelf] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b) => {
      if (subject !== "all" && b.subject !== subject) return false;
      if (shelf !== "all" && b.shelf !== shelf) return false;
      if (!needle) return true;
      return (
        b.title.toLowerCase().includes(needle) ||
        b.author.toLowerCase().includes(needle) ||
        b.code.toLowerCase().includes(needle)
      );
    });
  }, [q, subject, shelf]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const shelves = Array.from(new Set(books.map((b) => b.shelf)));

  return (
    <>
      <Topbar />
      <div className="shell no-panel">
        <Rail />
        <main className="center">
          <PageHead
            title="Kho sách"
            meta={`${filtered.length} cuốn trong ${books.length} mã sách`}
            actions={
              <>
                <button className="btn btn-quiet">Nhập sách mới</button>
                <button className="btn">Xuất danh mục</button>
              </>
            }
          />

          <div className="fieldset">
            <label className="search-inline">
              <Search size={14} strokeWidth={2} aria-hidden />
              <input
                type="search"
                placeholder="Tên sách, tác giả, mã sách"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                aria-label="Tìm trong kho sách"
              />
            </label>
            <select
              className="select-mini"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo chủ đề"
            >
              <option value="all">Mọi chủ đề</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="select-mini"
              value={shelf}
              onChange={(e) => {
                setShelf(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo khoang kệ"
            >
              <option value="all">Mọi khoang kệ</option>
              {shelves.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="filter-count">
              {filtered.length} kết quả
            </span>
          </div>

          <section className="section">
            <SectionTitle>Danh mục</SectionTitle>
            <Rows>
              {slice.map((b) => {
                const onLoan = loans.filter(
                  (l) => l.bookId === b.id && !l.returnedAt,
                ).length;
                const state =
                  b.available === 0
                    ? ("late" as const)
                    : b.available < b.copies
                      ? ("neutral" as const)
                      : ("ok" as const);
                return (
                  <Row key={b.id} className="c5">
                    <span className="no code">{b.code}</span>
                    <div>
                      <Link href={`/books/${b.id}`} className="title link">
                        {b.title}
                      </Link>
                      <span className="sub">
                        {b.author}, {b.year}, {b.subject}
                      </span>
                    </div>
                    <span className="who">{b.shelf}</span>
                    <span className="num">
                      {b.available}
                      <span className="of"> / {b.copies}</span>
                    </span>
                    <Status tone={state}>
                      {b.available === 0
                        ? "Hết bản"
                        : b.available < b.copies
                          ? `Còn ${b.available}, đang mượn ${onLoan}`
                          : "Sẵn có"}
                    </Status>
                  </Row>
                );
              })}
            </Rows>

            {filtered.length === 0 ? (
              <p className="filter-count" style={{ padding: "18px 2px" }}>
                Không có cuốn nào khớp bộ lọc. Xoá từ khoá để xem lại toàn bộ kho.
              </p>
            ) : null}

            <div className="pager">
              <span className="code">
                Trang {safePage} / {pages}
              </span>
              <span className="spacer" />
              <button
                className="btn btn-quiet"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
              >
                Trước
              </button>
              <button
                className="btn btn-quiet"
                onClick={() => setPage(Math.min(pages, safePage + 1))}
                disabled={safePage === pages}
              >
                Sau
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
