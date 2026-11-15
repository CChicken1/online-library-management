import Link from "next/link";
import { BookOpen, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Counts, PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { getSettings, listBooks, listMembers } from "@/lib/api";
import { loadIndex } from "@/lib/index-helpers";
import {
  daysLate,
  daysLeft,
  formatDate,
  formatVNDFull,
  todayISO,
} from "@/lib/types";

export default async function DashboardPage() {
  const today = todayISO();

  const [index, settings, books, members] = await Promise.all([
    loadIndex(),
    getSettings(),
    listBooks(),
    listMembers(),
  ]);

  const active = index.loans.filter((l) => !l.returnedAt);
  const overdue = active.filter((l) => l.status === "overdue");
  const dueToday = active.filter((l) => l.dueAt === today);

  const spines = active.map((l) => ({
    id: l.id,
    title: index.bookById.get(l.bookId)?.title ?? "",
    member: index.memberById.get(l.memberId)?.name ?? "",
    left: daysLeft(l.dueAt, today),
  }));

  const max = Math.max(...spines.map((s) => Math.abs(s.left)), 1);
  const totalCopies = books.reduce((s, b) => s + b.copies, 0);
  const availableCopies = books.reduce((s, b) => s + b.available, 0);

  const expiringMembers = members.filter((m) => {
    const d = daysLeft(m.expiryDate, today);
    return d >= 0 && d <= 60;
  });

  const uncollected = books.filter((b) => b.available === 0);

  return (
    <AppShell
      panel={
        <aside className="slip">
          <h2>Hôm nay</h2>
          <p className="when-label">{formatDate(today)}</p>

          <div className="slip-group">
            <div className="slip-row">
              <span className="t">{active.length}</span>
              <span className="m">cuốn đang lưu hành</span>
            </div>
            <div className="slip-row is-late">
              <span className="t">{overdue.length}</span>
              <span className="m">cuốn quá hạn</span>
            </div>
            <div className="slip-row">
              <span className="t">{dueToday.length}</span>
              <span className="m">đến hạn đúng hôm nay</span>
            </div>
          </div>

          <div className="slip-group">
            <h2>Phí trễ hạn</h2>
            <p className="when-label">{formatVNDFull(settings.finePerDay)} mỗi ngày</p>
            {overdue.map((l) => {
              const late = daysLate(l.dueAt, today);
              return (
                <div key={l.id} className="slip-row is-late">
                  <span className="t code">
                    {formatVNDFull(late * settings.finePerDay)}
                  </span>
                  <span className="m">
                    {index.memberById.get(l.memberId)?.name}
                    <br />
                    {index.bookById.get(l.bookId)?.title}, trễ {late} ngày
                  </span>
                </div>
              );
            })}
          </div>

          <Link className="btn" href="/loans">
            Mở danh sách mượn
          </Link>
        </aside>
      }
    >
      <PageHead
        title="Bàn làm việc"
        meta={`${formatDate(today)} · Bàn làm việc của thủ thư`}
        actions={
          <>
            <Link className="btn btn-quiet" href="/loans">
              <RotateCcw size={13} strokeWidth={2} aria-hidden />
              <span>Trả sách</span>
            </Link>
            <Link className="btn" href="/loans/issue">
              <BookOpen size={13} strokeWidth={2} aria-hidden />
              <span>Cho mượn</span>
            </Link>
          </>
        }
      />

      <section className="shelf-block">
        <div className="shelf-head">
          <h2 className="display">Kệ đang lưu hành</h2>
          <p>
            {spines.length} cuốn đang ngoài kệ. Chiều cao sống lưng là số ngày còn
            lại, màu son đỏ là sách đã quá hạn.
          </p>
        </div>

        <div className="shelf">
          {spines.map((s, i) => {
            const h = 26 + (Math.abs(s.left) / max) * 92;
            const hue = (i * 47) % 360;
            return (
              <Link
                key={s.id}
                href={`/loans?q=${encodeURIComponent(s.title)}`}
                className={s.left < 0 ? "spine is-late" : "spine"}
                style={{ height: `${h}px` }}
              >
                <span className="spine-title">{s.title}</span>
                <span className="spine-meta">
                  {s.member}
                  <br />
                  {s.left < 0 ? `trễ ${Math.abs(s.left)} ngày` : `còn ${s.left} ngày`}
                </span>
                <i className="spine-band" style={{ background: `hsl(${hue} 22% 34%)` }} />
              </Link>
            );
          })}
        </div>

        <div className="shelf-rule" />
        <div className="shelf-legend">
          <span>còn 0 ngày</span>
          <span>còn {max} ngày</span>
        </div>
      </section>

      <section className="section">
        <Counts
          columns={4}
          items={[
            { n: String(availableCopies), label: "Bản sẵn có" },
            { n: String(active.length), label: "Đang lưu hành" },
            { n: String(overdue.length), label: "Quá hạn", alert: true },
            { n: String(totalCopies - availableCopies), label: "Ra ngoài kệ" },
          ]}
        />
      </section>

      <section className="section">
        <SectionTitle count={`${dueToday.length} việc`}>Cần xử lý hôm nay</SectionTitle>
        <Rows>
          {dueToday.map((l) => (
            <Row key={l.id} className="task">
              <span className="no code">{formatDate(l.dueAt).slice(0, 5)}</span>
              <div>
                <Link href={`/books/${l.bookId}`} className="title link">
                  {index.bookById.get(l.bookId)?.title}
                </Link>
                <span className="sub">
                  {index.memberById.get(l.memberId)?.name}, thẻ{" "}
                  {index.memberById.get(l.memberId)?.code}
                </span>
              </div>
              <Status tone="late">Hết hạn hôm nay</Status>
            </Row>
          ))}

          {expiringMembers.slice(0, 3).map((m) => (
            <Row key={m.id} className="task">
              <span className="no code">{formatDate(m.expiryDate).slice(0, 5)}</span>
              <div>
                <span className="title">{m.name}</span>
                <span className="sub">
                  Hạn thẻ, hạng {m.tier}, đang mượn {m.borrowCount} cuốn
                </span>
              </div>
              <Status tone="neutral">Gia hạn thẻ</Status>
            </Row>
          ))}

          {uncollected.slice(0, 2).map((b) => (
            <Row key={b.id} className="task">
              <span className="no code">{b.code}</span>
              <div>
                <Link href={`/books/${b.id}`} className="title link">
                  {b.title}
                </Link>
                <span className="sub">Hết bản sẵn có, cần nhập thêm</span>
              </div>
              <Status tone="neutral">Tạo đơn nhập</Status>
            </Row>
          ))}
        </Rows>
      </section>

      <section className="section">
        <SectionTitle count={`${active.length} phiếu`}>Phiếu đang mở</SectionTitle>
        <Rows>
          {active.slice(0, 5).map((l) => (
            <Row key={l.id} className="c4">
              <span className="no code">{l.receiptCode.slice(-3)}</span>
              <div>
                <span className="title">{index.bookById.get(l.bookId)?.title}</span>
                <span className="sub">{index.memberById.get(l.memberId)?.name}</span>
              </div>
              <span className="who">{index.memberById.get(l.memberId)?.code}</span>
              <span className="when code">{formatDate(l.borrowedAt)}</span>
            </Row>
          ))}
        </Rows>
      </section>
    </AppShell>
  );
}
