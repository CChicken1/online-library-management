import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  books,
  formatDate,
  getBook,
  getMember,
  loans,
} from "@/lib/data";

export function generateStaticParams() {
  return books.map((b) => ({ id: b.id }));
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const copies = Array.from({ length: book.copies }, (_, i) => {
    const label = String.fromCharCode(65 + Math.floor(i / 3));
    const n = (i % 3) + 1;
    return `${label}${n}`;
  });

  const activeLoans = loans.filter((l) => l.bookId === book.id && !l.returnedAt);
  const pastLoans = loans.filter((l) => l.bookId === book.id && l.returnedAt);

  return (
    <>
      <Topbar />
      <div className="shell">
        <Rail />
        <main className="center">
          <Link className="back-link" href="/books">
            <ArrowLeft size={13} strokeWidth={2} aria-hidden />
            Về kho sách
          </Link>

          <PageHead
            title={book.title}
            meta={
              <>
                <span className="code">{book.code}</span>
                <span>
                  {book.author}, {book.publisher}, {book.year}
                </span>
              </>
            }
            actions={
              <>
                <button className="btn btn-quiet">Sửa hồ sơ</button>
                <Link className="btn" href="/loans/issue">
                  Cho mượn
                </Link>
              </>
            }
          />

          <div className="detail-grid">
            <div className="detail-main">
              <section className="section">
                <SectionTitle>Tóm tắt</SectionTitle>
                <p className="abstract">{book.summary}</p>
              </section>

              <section className="section">
                <SectionTitle count={`${activeLoans.length} bản đang mượn`}>
                  Người đang mượn
                </SectionTitle>
                {activeLoans.length === 0 ? (
                  <p className="muted">Chưa có bản nào đang lưu hành.</p>
                ) : (
                  <Rows>
                    {activeLoans.map((l) => {
                      const member = getMember(l.memberId);
                      const late = l.dueAt < "2026-11-15";
                      return (
                        <Row key={l.id} className="c4">
                          <span className="no code">{l.copyLabel}</span>
                          <div>
                            <span className="title">{member?.name}</span>
                            <span className="sub">
                              Thẻ {member?.code}, hạng {member?.tier}
                            </span>
                          </div>
                          <span className="who code">
                            Hạn {formatDate(l.dueAt)}
                          </span>
                          <Status tone={late ? "late" : "neutral"}>
                            {late ? "Trễ hạn" : "Còn lưu hành"}
                          </Status>
                        </Row>
                      );
                    })}
                  </Rows>
                )}
              </section>

              {pastLoans.length > 0 ? (
                <section className="section">
                  <SectionTitle>Lịch sử</SectionTitle>
                  <Rows>
                    {pastLoans.map((l) => {
                      const member = getMember(l.memberId);
                      return (
                        <Row key={l.id} className="c4">
                          <span className="no code">{l.copyLabel}</span>
                          <div>
                            <span className="title">{member?.name}</span>
                            <span className="sub">Phiếu {l.id}</span>
                          </div>
                          <span className="who code">
                            {l.borrowedAt} → {l.returnedAt}
                          </span>
                          <Status tone="neutral">Đã trả</Status>
                        </Row>
                      );
                    })}
                  </Rows>
                </section>
              ) : null}
            </div>

            <aside className="detail-side">
              <div className="cover">
                <span className="cover-title">{book.coverTitle}</span>
                <span className="cover-author">{book.author}</span>
                <span className="cover-subject">{book.subject}</span>
              </div>

              <dl className="facts">
                <div>
                  <dt>Mã kho</dt>
                  <dd className="code">{book.code}</dd>
                </div>
                <div>
                  <dt>Chủ đề</dt>
                  <dd>{book.subject}</dd>
                </div>
                <div>
                  <dt>Từ khoá</dt>
                  <dd>{book.keywords}</dd>
                </div>
                <div>
                  <dt>Nhà xuất bản</dt>
                  <dd>{book.publisher}</dd>
                </div>
                <div>
                  <dt>Năm xuất bản</dt>
                  <dd className="code">{book.year}</dd>
                </div>
                <div>
                  <dt>Số trang</dt>
                  <dd className="code">{book.pages}</dd>
                </div>
                <div>
                  <dt>Vị trí kệ</dt>
                  <dd>{book.shelf}</dd>
                </div>
              </dl>

              <div className="copy-list">
                <h3>Bản hiện có</h3>
                <ul>
                  {copies.map((c, i) => {
                    const taken = activeLoans.some((l) => l.copyLabel === c);
                    return (
                      <li key={c}>
                        <span className="code">{c}</span>
                        <Status tone={taken ? "late" : "ok"}>
                          {taken ? "Đang mượn" : "Trong kệ"}
                        </Status>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
