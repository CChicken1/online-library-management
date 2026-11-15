"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHead, Row, Rows, SectionTitle, Status } from "@/components/ui";
import { Rail, Topbar } from "@/components/shell";
import {
  daysLeft,
  formatDate,
  getMember,
  isMembershipValid,
  loans,
  members,
  remainingQuota,
} from "@/lib/data";

export default function MembersPage() {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(needle) ||
        m.code.includes(needle) ||
        m.email.toLowerCase().includes(needle),
    );
  }, [q]);

  const expiring = members.filter((m) => {
    const d = daysLeft(m.expiryDate);
    return d >= 0 && d <= 60;
  });

  const atQuota = members.filter(
    (m) => m.maxBooks > 0 && m.borrowCount >= m.maxBooks,
  );

  return (
    <>
      <Topbar />
      <div className="shell no-panel">
        <Rail />
        <main className="center">
          <PageHead
            title="Hội viên"
            meta={`${members.length} thẻ đang cấp, ${expiring.length} thẻ sắp hết hạn`}
            actions={
              <>
                <button className="btn btn-quiet">Nhập danh sách</button>
                <button className="btn">Cấp thẻ mới</button>
              </>
            }
          />

          <div className="fieldset">
            <label className="search-inline">
              <Search size={14} strokeWidth={2} aria-hidden />
              <input
                type="search"
                placeholder="Tên, số thẻ, email"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Tìm hội viên"
              />
            </label>
            <span className="filter-count">{list.length} hội viên</span>
          </div>

          <section className="section">
            <SectionTitle>Danh sách thẻ</SectionTitle>
            <Rows>
              {list.map((m) => {
                const valid = isMembershipValid(m.expiryDate);
                const activeLoans = loans.filter(
                  (l) => l.memberId === m.id && !l.returnedAt,
                ).length;
                const over = activeLoans > m.maxBooks;
                return (
                  <Row key={m.id} className="mem">
                    <div>
                      <span className="title">{m.name}</span>
                      <span className="sub">
                        Thẻ {m.code}, {m.email}
                      </span>
                    </div>
                    <span className="who">{m.tier}</span>
                    <span className="num">
                      {activeLoans}
                      <span className="of"> / {m.maxBooks}</span>
                    </span>
                    <span className="who code">
                      {formatDate(m.expiryDate)}
                      {!valid ? (
                        <span className="sub late-sub">Đã quá hạn</span>
                      ) : daysLeft(m.expiryDate) <= 60 ? (
                        <span className="sub">Còn {daysLeft(m.expiryDate)} ngày</span>
                      ) : null}
                    </span>
                    <Status tone={over ? "late" : valid ? "ok" : "neutral"}>
                      {over
                        ? "Vượt hạn mức"
                        : valid
                          ? "Còn hiệu lực"
                          : "Hết hạn"}
                    </Status>
                  </Row>
                );
              })}
            </Rows>
          </section>

          {expiring.length > 0 ? (
            <section className="section">
              <SectionTitle count={`${expiring.length} thẻ`}>
                Thẻ hết hạn trong 60 ngày
              </SectionTitle>
              <Rows>
                {expiring.map((m) => (
                  <Row key={m.id} className="c4">
                    <span className="no code">{m.code}</span>
                    <div>
                      <span className="title">{m.name}</span>
                      <span className="sub">
                        Hạng {m.tier}, còn {remainingQuota(m)} cuốn có thể mượn
                      </span>
                    </div>
                    <span className="who code">{formatDate(m.expiryDate)}</span>
                    <Status tone="neutral">Gia hạn</Status>
                  </Row>
                ))}
              </Rows>
            </section>
          ) : null}

          {atQuota.length > 0 ? (
            <section className="section">
              <SectionTitle count={`${atQuota.length} người`}>
                Đã đạt hạn mức mượn
              </SectionTitle>
              <Rows>
                {atQuota.map((m) => (
                  <Row key={m.id} className="c4">
                    <span className="no code">{m.code}</span>
                    <div>
                      <span className="title">{m.name}</span>
                      <span className="sub">
                        Hạng {m.tier}, tối đa {m.maxBooks} cuốn
                      </span>
                    </div>
                    <span className="who code">
                      {m.borrowCount} cuốn đang mượn
                    </span>
                    <Status tone="late">Chặn mượn mới</Status>
                  </Row>
                ))}
              </Rows>
            </section>
          ) : null}
        </main>
      </div>
    </>
  );
}
