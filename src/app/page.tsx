import Link from "next/link";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { Counts, PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  FINE_PER_DAY,
  TODAY,
  books,
  daysLate,
  daysLeft,
  formatDate,
  formatDateShort,
  formatVNDFull,
  getBook,
  getMember,
  loans,
  members,
} from "@/lib/data";

/* ==========================================================================
   KỆ ĐANG LƯU HÀNH
   Yếu tố nổi bật duy nhất của trang. Mỗi cuốn sách là một sống lưng:
   chiều cao = số ngày còn lại, màu = trạng thái.
   ========================================================================== */

type Spine = {
  id: string;
  title: string;
  member: string;
  left: number;
  late: boolean;
  hue: number;
};

function buildShelf(): Spine[] {
  return loans
    .filter((l) => !l.returnedAt)
    .map((l, i) => {
      const left = daysLeft(l.dueAt);
      const book = getBook(l.bookId);
      const member = getMember(l.memberId);
      return {
        id: l.id,
        title: book?.title ?? "",
        member: member?.name ?? "",
        left,
        late: left < 0,
        hue: (i * 47) % 360,
      };
    });
}

function Shelf() {
  const spines = buildShelf();
  const max = Math.max(...spines.map((s) => Math.abs(s.left)), 1);

  return (
    <section className="shelf-block">
      <div className="shelf-head">
        <h2 className="display">Kệ đang lưu hành</h2>
        <p>
          {spines.length} cuốn đang ngoài kệ. Chiều cao sống lưng là số ngày còn
          lại, màu son đỏ là sách đã quá hạn.
        </p>
      </div>

      <div className="shelf">
        {spines.map((s) => {
          const h = 26 + (Math.abs(s.left) / max) * 92;
          return (
            <Link
              key={s.id}
              href={`/loans/${s.id}`}
              className={s.late ? "spine is-late" : "spine"}
              style={{ height: `${h}px` }}
            >
              <span className="spine-title">{s.title}</span>
              <span className="spine-meta">
                {s.member}
                <br />
                {s.left < 0
                  ? `trễ ${Math.abs(s.left)} ngày`
                  : `còn ${s.left} ngày`}
              </span>
              <i
                className="spine-band"
                style={{ background: `hsl(${s.hue} 22% 34%)` }}
              />
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
  );
}

/* ========================================================================== */

export default function DashboardPage() {
  const active = loans.filter((l) => !l.returnedAt);
  const overdue = active.filter((l) => l.status === "overdue");
  const totalCopies = books.reduce((s, b) => s + b.copies, 0);
  const availCopies = books.reduce((s, b) => s + b.available, 0);

  const dueToday = active.filter((l) => l.dueAt === TODAY);
  const expiringMembers = members.filter(
    (m) => daysLeft(m.expiryDate) >= 0 && daysLeft(m.expiryDate) <= 60,
  );

  const uncollected = books.filter((b) => b.available === 0);

  return (
    <>
      <Topbar />
      <div className="shell">
        <Rail />
        <main className="center">
          <PageHead
            title="Bàn làm việc"
            meta={`${formatDate(TODAY)} · Thủ thư Trần Thanh`}
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

          <Shelf />

          <section className="section">
            <Counts
              columns={4}
              items={[
                { n: String(availCopies), label: "Bản sẵn có" },
                { n: String(active.length), label: "Đang lưu hành" },
                { n: String(overdue.length), label: "Quá hạn", alert: true },
                { n: String(totalCopies - availCopies), label: "Ra ngoài kệ" },
              ]}
            />
          </section>

          <section className="section">
            <SectionTitle count={`${dueToday.length} việc`}>
              Cần xử lý hôm nay
            </SectionTitle>
            <Rows>
              {dueToday.map((l) => {
                const book = getBook(l.bookId);
                const member = getMember(l.memberId);
                return (
                  <Row key={l.id} className="task">
                    <span className="no code">{formatDateShort(l.dueAt)}</span>
                    <div>
                      <Link href={`/books/${l.bookId}`} className="title link">
                        {book?.title}
                      </Link>
                      <span className="sub">
                        {member?.name}, thẻ {member?.code}
                      </span>
                    </div>
                    <Status tone="late">Hết hạn hôm nay</Status>
                  </Row>
                );
              })}

              {expiringMembers.slice(0, 3).map((m) => (
                <Row key={m.id} className="task">
                  <span className="no code">{formatDateShort(m.expiryDate)}</span>
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
            <SectionTitle count="4 phiếu gần đây">
              Trả sách gần đây
            </SectionTitle>
            <Rows>
              {loans.slice(0, 4).map((l) => {
                const book = getBook(l.bookId);
                const member = getMember(l.memberId);
                return (
                  <Row key={l.id} className="c4">
                    <span className="no code">{l.id.slice(-3)}</span>
                    <div>
                      <span className="title">{book?.title}</span>
                      <span className="sub">{member?.name}</span>
                    </div>
                    <span className="who">{member?.code}</span>
                    <span className="when code">{formatDate(l.borrowedAt)}</span>
                  </Row>
                );
              })}
            </Rows>
          </section>
        </main>

        <aside className="slip">
          <h2>Hôm nay</h2>
          <p className="when-label">{formatDate(TODAY)}</p>

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
            <p className="when-label">
              {formatVNDFull(FINE_PER_DAY)} mỗi ngày
            </p>
            {overdue.map((l) => {
              const late = daysLate(l.dueAt);
              const member = getMember(l.memberId);
              const book = getBook(l.bookId);
              return (
                <div key={l.id} className="slip-row is-late">
                  <span className="t code">{formatVNDFull(late * FINE_PER_DAY)}</span>
                  <span className="m">
                    {member?.name}
                    <br />
                    {book?.title}, trễ {late} ngày
                  </span>
                </div>
              );
            })}
          </div>

          <Link className="btn" href="/loans">
            Mở danh sách mượn
            <ArrowRight size={13} strokeWidth={2} aria-hidden />
          </Link>
        </aside>
      </div>
    </>
  );
}
