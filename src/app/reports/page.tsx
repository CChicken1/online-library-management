import { AppShell } from "@/components/app-shell";
import { PageHead, SectionTitle } from "@/components/ui";
import { getBook, getSettings, getStats, listLoans } from "@/lib/api";
import { daysLate, formatVND, formatVNDFull, todayISO } from "@/lib/types";

/* ---------------- Biểu đồ thanh kẻ ---------------- */

function BarChart({
  rows,
  max,
}: {
  rows: { cat: string; value: number }[];
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

export default async function ReportsPage() {
  const today = todayISO();

  const [stats, loans, settings] = await Promise.all([
    getStats(),
    listLoans(today),
    getSettings(),
  ]);

  const active = loans.filter((l) => !l.returnedAt);
  const overdue = active.filter((l) => l.status === "overdue");

  // Số bản theo chủ đề, tính từ view book_stock.
  const subjectRows = stats.bySubject
    .map((s) => ({ cat: s.subject, value: s.count }))
    .sort((a, b) => b.value - a.value);
  const subjectMax = Math.max(...subjectRows.map((r) => r.value), 1);
  const subjectTotal = subjectRows.reduce((s, r) => s + r.value, 0) || 1;

  const shareRows = subjectRows.map((r) => ({
    cat: r.cat,
    value: Math.round((r.value / subjectTotal) * 100),
  }));

  const bookTitles = await loadTitles(stats.borrowCount.map((b) => b.bookId));

  // Tải tên sách và tên hội viên một lần cho danh sách phí trễ hạn.
  const { listBooks, listMembers } = await import("@/lib/api");
  const [allBooks, allMembers] = await Promise.all([listBooks(), listMembers()]);
  const titleOf = new Map(allBooks.map((b) => [b.id, b.title]));
  const nameOf = new Map(allMembers.map((m) => [m.id, m.name]));

  const borrowRows = stats.borrowCount
    .map((b) => ({
      cat: bookTitles.get(b.bookId) ?? "Sách đã xoá",
      value: b.count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const borrowMax = Math.max(...borrowRows.map((r) => r.value), 1);

  const fineTotal = overdue.reduce(
    (s, l) => s + daysLate(l.dueAt, today) * settings.finePerDay,
    0,
  );
  const avgLate = overdue.length
    ? Math.round(
        overdue.reduce((s, l) => s + daysLate(l.dueAt, today), 0) / overdue.length,
      )
    : 0;

  return (
    <AppShell>
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
            <span className="n">{stats.totalCopies}</span>
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
                Tỉ trọng theo số đầu sách
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <SectionTitle>Sách được mượn nhiều nhất</SectionTitle>
          {borrowRows.length === 0 ? (
            <p className="muted">Chưa có dữ liệu mượn.</p>
          ) : (
            <BarChart rows={borrowRows} max={borrowMax} />
          )}
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
              <span className="n">{formatVNDFull(settings.finePerDay)}</span>
              <span className="label">Đơn giá mỗi ngày</span>
            </div>
          </div>

          <div className="fine-list">
            {overdue.map((l) => {
              const late = daysLate(l.dueAt, today);
              return (
                <div key={l.id} className="fine-row">
                  <span className="code">{l.receiptCode}</span>
                  <span className="who">
                    {nameOf.get(l.memberId) ?? "Hội viên đã xoá"}
                    <br />
                    {titleOf.get(l.bookId) ?? "Sách đã xoá"}
                  </span>
                  <span className="who code">{late} ngày</span>
                  <span className="num alert">
                    {formatVNDFull(late * settings.finePerDay)}
                  </span>
                </div>
              );
            })}
            {overdue.length === 0 ? (
              <p className="muted">Không có khoản nợ trễ hạn nào.</p>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

async function loadTitles(bookIds: string[]) {
  const map = new Map<string, string>();
  await Promise.all(
    bookIds.map(async (id) => {
      const b = await getBook(id);
      if (b) map.set(id, b.title);
    }),
  );
  return map;
}