import { PageHead, SectionTitle, Status } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  FINE_PER_DAY,
  books,
  daysLate,
  formatVND,
  formatVNDFull,
  getBook,
  getMember,
  loans,
} from "@/lib/data";

/* ---------------- Biểu đồ thanh kẻ ---------------- */

function BarChart({
  rows,
  max,
}: {
  rows: { cat: string; value: number; late?: number }[];
  max: number;
}) {
  return (
    <div>
      {rows.map((r) => (
        <div className="chart-row" key={r.cat}>
          <span className="cat">{r.cat}</span>
          <span className="track">
            <i
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
              aria-hidden
            />
          </span>
          <span className="v">{r.value}</span>
        </div>
      ))}
      <div className="chart-axis">
        <span />
        <span>
          <span>0</span>
          <span>{max}</span>
        </span>
        <span />
      </div>
    </div>
  );
}

/* ========================================================================== */

export default function ReportsPage() {
  const active = loans.filter((l) => !l.returnedAt);
  const overdue = active.filter((l) => l.status === "overdue");

  const bySubject = books.reduce<Record<string, number>>((acc, b) => {
    acc[b.subject] = (acc[b.subject] ?? 0) + b.copies;
    return acc;
  }, {});
  const subjectRows = Object.entries(bySubject)
    .map(([cat, value]) => ({ cat, value }))
    .sort((a, b) => b.value - a.value);
  const subjectMax = Math.max(...subjectRows.map((r) => r.value));

  const totalCopies = books.reduce((s, b) => s + b.copies, 0);
  const shareRows = subjectRows.map((r) => ({
    cat: r.cat,
    value: Math.round((r.value / totalCopies) * 100),
  }));

  const borrowCount = books
    .map((b) => ({
      title: b.title,
      code: b.code,
      n: loans.filter((l) => l.bookId === b.id).length,
    }))
    .filter((b) => b.n > 0)
    .sort((a, b) => b.n - a.n);
  const borrowMax = Math.max(...borrowCount.map((b) => b.n), 1);

  const fineTotal = overdue.reduce(
    (sum, l) => sum + daysLate(l.dueAt) * FINE_PER_DAY,
    0,
  );
  const avgLate = overdue.length
    ? Math.round(
        overdue.reduce((s, l) => s + daysLate(l.dueAt), 0) / overdue.length,
      )
    : 0;

  return (
    <>
      <Topbar />
      <div className="shell no-panel">
        <Rail />
        <main className="center">
          <PageHead
            title="Báo cáo"
            meta="Lưu lượng mượn trả, tỉ lệ quá hạn, doanh thu phí"
            actions={
              <>
                <button className="btn btn-quiet">Kỳ 30 ngày</button>
                <button className="btn">In báo cáo</button>
              </>
            }
          />

          <section className="section">
            <SectionTitle>Tổng quan</SectionTitle>
            <div className="counts counts-4">
              <div>
                <span className="n">{totalCopies}</span>
                <span className="label">Bản sách trong kho</span>
              </div>
              <div>
                <span className="n">{active.length}</span>
                <span className="label">Đang lưu hành</span>
              </div>
              <div>
                <span className="n alert">{overdue.length}</span>
                <span className="label">Quá hạn</span>
              </div>
              <div>
                <span className="n">{formatVND(fineTotal)}</span>
                <span className="label">Phí trễ hạn đang nợ</span>
              </div>
            </div>
          </section>

          <div className="report-grid">
            <section className="section">
              <SectionTitle>Sách theo chủ đề</SectionTitle>
              <BarChart rows={subjectRows} max={subjectMax} />
            </section>

            <section className="section">
              <SectionTitle>Tỉ lệ theo chủ đề</SectionTitle>
              <div>
                {shareRows.map((r) => (
                  <div className="chart-row" key={r.cat}>
                    <span className="cat">{r.cat}</span>
                    <span className="bar">
                      <span className="seg-a" style={{ width: `${r.value}%` }} />
                    </span>
                    <span className="v">{r.value}%</span>
                  </div>
                ))}
                <div className="legend">
                  <span>
                    <i style={{ background: "var(--color-ink)" }} />
                    Tỉ trọng theo số bản
                  </span>
                </div>
              </div>
            </section>

            <section className="section">
              <SectionTitle>Sách được mượn nhiều nhất</SectionTitle>
              <BarChart
                rows={borrowCount.map((b) => ({ cat: b.title, value: b.n }))}
                max={borrowMax}
              />
            </section>

            <section className="section">
              <SectionTitle>Phí trễ hạn</SectionTitle>
              <div className="counts counts-3">
                <div>
                  <span className="n">{formatVND(fineTotal)}</span>
                  <span className="label">Tổng đang nợ</span>
                </div>
                <div>
                  <span className="n">{avgLate}</span>
                  <span className="label">Ngày trễ trung bình</span>
                </div>
                <div>
                  <span className="n">{formatVNDFull(FINE_PER_DAY)}</span>
                  <span className="label">Đơn giá mỗi ngày</span>
                </div>
              </div>

              <div className="fine-list">
                {overdue.map((l) => {
                  const member = getMember(l.memberId);
                  const book = getBook(l.bookId);
                  const late = daysLate(l.dueAt);
                  return (
                    <div key={l.id} className="fine-row">
                      <span className="code">{l.id}</span>
                      <span className="who">
                        {member?.name}
                        <br />
                        {book?.title}
                      </span>
                      <span className="who code">{late} ngày</span>
                      <span className="num alert">
                        {formatVNDFull(late * FINE_PER_DAY)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
