import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { getBook, listBookCopies, listLoans, listMembers } from "@/lib/api";
import { formatDate, todayISO } from "@/lib/types";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = todayISO();

  const book = await getBook(id);
  if (!book) notFound();

  const [copies, loans, members] = await Promise.all([
    listBookCopies(book.id),
    listLoans(today),
    listMembers(),
  ]);

  const activeLoans = loans.filter((l) => l.bookId === book.id && !l.returnedAt);
  const pastLoans = loans.filter((l) => l.bookId === book.id && l.returnedAt);

  const memberById = new Map(members.map((m) => [m.id, m]));

  return (
    <AppShell>
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
              {book.author}
              {book.publisher ? `, ${book.publisher}` : ""}
              {book.year ? `, ${book.year}` : ""}
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
            <p className="abstract">{book.summary ?? "Chưa có tóm tắt."}</p>
          </section>

          <section className="section">
            <SectionTitle count={`${activeLoans.length} bản đang mượn`}>
              Người đang mượn
            </SectionTitle>
            {activeLoans.length === 0 ? (
              <p className="muted">Chưa có bản nào đang lưu hành.</p>
            ) : (
              <Rows>
                {activeLoans.map((l) => (
                  <Row key={l.id} className="c4">
                    <span className="no code">{l.copyLabel}</span>
                    <div>
                      <span className="title">
                        {memberById.get(l.memberId)?.name}
                      </span>
                      <span className="sub">
                        Thẻ {memberById.get(l.memberId)?.code}, hạn{" "}
                        {formatDate(l.dueAt)}
                      </span>
                    </div>
                    <span className="who code">{l.receiptCode}</span>
                    <Status tone={l.status === "overdue" ? "late" : "neutral"}>
                      {l.status === "overdue" ? "Trễ hạn" : "Còn lưu hành"}
                    </Status>
                  </Row>
                ))}
              </Rows>
            )}
          </section>

          {pastLoans.length > 0 ? (
            <section className="section">
              <SectionTitle>Lịch sử</SectionTitle>
              <Rows>
                {pastLoans.map((l) => (
                  <Row key={l.id} className="c4">
                    <span className="no code">{l.copyLabel}</span>
                    <div>
                      <span className="title">
                        {memberById.get(l.memberId)?.name}
                      </span>
                      <span className="sub">Phiếu {l.receiptCode}</span>
                    </div>
                    <span className="who code">
                      {formatDate(l.borrowedAt)} → {formatDate(l.returnedAt!)}
                    </span>
                    <Status tone="neutral">Đã trả</Status>
                  </Row>
                ))}
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
            {book.keywords ? (
              <div>
                <dt>Từ khoá</dt>
                <dd>{book.keywords}</dd>
              </div>
            ) : null}
            {book.publisher ? (
              <div>
                <dt>Nhà xuất bản</dt>
                <dd>{book.publisher}</dd>
              </div>
            ) : null}
            {book.year ? (
              <div>
                <dt>Năm xuất bản</dt>
                <dd className="code">{book.year}</dd>
              </div>
            ) : null}
            {book.pages ? (
              <div>
                <dt>Số trang</dt>
                <dd className="code">{book.pages}</dd>
              </div>
            ) : null}
            {book.shelf ? (
              <div>
                <dt>Vị trí kệ</dt>
                <dd>{book.shelf}</dd>
              </div>
            ) : null}
          </dl>

          <div className="copy-list">
            <h3>Bản hiện có</h3>
            <ul>
              {copies.map((c) => {
                const taken = activeLoans.some((l) => l.copyId === c.id);
                return (
                  <li key={c.id}>
                    <span className="code">{c.copyLabel}</span>
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
    </AppShell>
  );
}
