"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Search } from "lucide-react";
import { Field, PageHead, Row, Rows, SectionTitle } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  FINE_PER_DAY,
  TODAY,
  books,
  daysLate,
  formatDate,
  getBook,
  getMember,
  isMembershipValid,
  loans,
  members,
} from "@/lib/data";

const LOAN_DAYS = 14;

export default function IssuePage() {
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [query, setQuery] = useState("");
  const [issued, setIssued] = useState<string | null>(null);

  const book = getBook(bookId);
  const member = getMember(memberId);

  const bookOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return books
      .filter((b) => b.available > 0)
      .filter(
        (b) =>
          !needle ||
          b.title.toLowerCase().includes(needle) ||
          b.code.toLowerCase().includes(needle),
      );
  }, [query]);

  const memberOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        !needle ||
        m.name.toLowerCase().includes(needle) ||
        m.code.includes(needle),
    );
  }, [query]);

  const memberActive = member
    ? loans.filter((l) => l.memberId === member.id && !l.returnedAt).length
    : 0;

  const memberValid = member ? isMembershipValid(member.expiryDate) : false;
  const memberLate = member
    ? loans.some(
        (l) => l.memberId === member.id && l.status === "overdue",
      )
    : false;

  const overdueForMember = member
    ? loans.filter((l) => l.memberId === member.id && l.status === "overdue")
    : [];

  const fineDue = overdueForMember.reduce(
    (sum, l) => sum + daysLate(l.dueAt) * FINE_PER_DAY,
    0,
  );

  const dueAt = new Date(TODAY);
  dueAt.setDate(dueAt.getDate() + LOAN_DAYS);
  const dueAtIso = dueAt.toISOString().slice(0, 10);

  const blocked =
    !member ||
    !book ||
    !memberValid ||
    memberActive >= member.maxBooks ||
    book.available <= 0;

  return (
    <>
      <Topbar />
      <div className="shell">
        <Rail />
        <main className="center">
          <PageHead
            title="Cho mượn"
            meta="Tạo phiếu mượn mới và giao sách tại quầy"
          />

          {issued ? (
            <div className="notice is-ok">
              <Check size={15} strokeWidth={2.2} aria-hidden />
              <div>
                <strong>Đã tạo phiếu {issued}.</strong>
                <span>
                  Trả sách trước {formatDate(dueAtIso)}. Cập nhật kho đã trừ 1 bản.
                </span>
              </div>
            </div>
          ) : null}

          <div className="issue-grid">
            <div>
              <section className="section">
                <SectionTitle>Bước 1, chọn sách</SectionTitle>
                <Field label="Tìm trong kho" hint="Chỉ hiện cuốn còn bản sẵn có">
                  <div className="search-inline wide">
                    <Search size={14} strokeWidth={2} aria-hidden />
                    <input
                      type="search"
                      placeholder="Tên sách hoặc mã kho"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Tìm sách"
                    />
                  </div>
                </Field>

                <Rows>
                  {bookOptions.slice(0, 5).map((b) => (
                    <Row key={b.id} className="c3">
                      <span className="no code">{b.code}</span>
                      <div>
                        <span className="title">{b.title}</span>
                        <span className="sub">
                          {b.author}, còn {b.available} trên {b.copies} bản
                        </span>
                      </div>
                      <button
                        className={bookId === b.id ? "btn is-on" : "btn btn-quiet"}
                        onClick={() => setBookId(b.id)}
                      >
                        {bookId === b.id ? "Đã chọn" : "Chọn"}
                      </button>
                    </Row>
                  ))}
                  {bookOptions.length === 0 ? (
                    <p className="muted">Không còn cuốn nào sẵn có khớp từ khoá.</p>
                  ) : null}
                </Rows>
              </section>

              <section className="section">
                <SectionTitle>Bước 2, chọn hội viên</SectionTitle>
                <Rows>
                  {memberOptions.slice(0, 5).map((m) => (
                    <Row key={m.id} className="c3">
                      <span className="no code">{m.code}</span>
                      <div>
                        <span className="title">{m.name}</span>
                        <span className="sub">
                          Hạng {m.tier}, đang mượn{" "}
                          {loans.filter(
                            (l) => l.memberId === m.id && !l.returnedAt,
                          ).length}{" "}
                          trên {m.maxBooks}
                        </span>
                      </div>
                      <button
                        className={memberId === m.id ? "btn is-on" : "btn btn-quiet"}
                        onClick={() => setMemberId(m.id)}
                      >
                        {memberId === m.id ? "Đã chọn" : "Chọn"}
                      </button>
                    </Row>
                  ))}
                </Rows>
              </section>
            </div>

            <aside className="slip issue-slip">
              <h2>Phiếu mượn</h2>
              <p className="when-label">Kiểm tra trước khi giao sách</p>

              <div className="slip-group">
                <div className="slip-row">
                  <span className="t">{book ? book.title : "Chưa chọn sách"}</span>
                  <span className="m">
                    {book
                      ? `${book.author}, bản ${book.copies - book.available + 1} trong kho`
                      : "Tìm và chọn một cuốn ở bước 1"}
                  </span>
                </div>
                <div className="slip-row">
                  <span className="t">{member ? member.name : "Chưa chọn hội viên"}</span>
                  <span className="m">
                    {member
                      ? `Thẻ ${member.code}, hạng ${member.tier}`
                      : "Tìm và chọn một thẻ ở bước 2"}
                  </span>
                </div>
                <div className="slip-row">
                  <span className="t code">{formatDate(dueAtIso)}</span>
                  <span className="m">Hạn trả sau {LOAN_DAYS} ngày</span>
                </div>
              </div>

              {member && !memberValid ? (
                <div className="notice is-bad">
                  <AlertTriangle size={15} strokeWidth={2.2} aria-hidden />
                  <div>
                    <strong>Thẻ đã hết hạn.</strong>
                    <span>Hạn thẻ {formatDate(member.expiryDate)}. Cần gia hạn trước.</span>
                  </div>
                </div>
              ) : null}

              {member && memberActive >= member.maxBooks ? (
                <div className="notice is-bad">
                  <AlertTriangle size={15} strokeWidth={2.2} aria-hidden />
                  <div>
                    <strong>Đã đạt hạn mức mượn.</strong>
                    <span>
                      Đang mượn {memberActive} trên {member.maxBooks} cuốn.
                    </span>
                  </div>
                </div>
              ) : null}

              {memberLate ? (
                <div className="notice is-bad">
                  <AlertTriangle size={15} strokeWidth={2.2} aria-hidden />
                  <div>
                    <strong>Có sách quá hạn.</strong>
                    <span>
                      {overdueForMember.length} cuốn trễ hạn, nợ phí{" "}
                      {fineDue.toLocaleString("vi-VN")} đ. Cần thu trước khi mượn
                      tiếp.
                    </span>
                  </div>
                </div>
              ) : null}

              <button
                className="btn btn-full"
                disabled={blocked}
                onClick={() => setIssued(`PM-2026-1115-${Math.floor(100 + Math.random() * 900)}`)}
              >
                {blocked ? "Chưa đủ điều kiện" : "Giao sách và tạo phiếu"}
              </button>

              <Link className="back-link" href="/loans">
                Quay lại danh sách phiếu
              </Link>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
