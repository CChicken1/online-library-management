import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHead } from "@/components/ui";
import { IssueForm, type IssueMember, type IssueOption } from "./issue-form";
import {
  getSettings,
  listBookCopies,
  listBooks,
  listLoans,
  listMembers,
} from "@/lib/api";
import { computeFine, daysLate, todayISO } from "@/lib/types";

/**
 * Trang tạo phiếu mượn.
 *
 * Server component chuẩn bị sẵn danh sách đầu sách, bản vật lý và hội viên
 * để form client không phải gọi mạng khi mở trang.
 */
export default async function IssueLoanPage() {
  const today = todayISO();

  const [books, members, loans, settings] = await Promise.all([
    listBooks(),
    listMembers(),
    listLoans(today),
    getSettings(),
  ]);

  // Bản vật lý đang bị mượn của từng đầu sách.
  const takenByBook = new Map<string, Set<string>>();
  for (const loan of loans) {
    if (loan.returnedAt || !loan.copyId) continue;
    const set = takenByBook.get(loan.bookId) ?? new Set<string>();
    set.add(loan.copyId);
    takenByBook.set(loan.bookId, set);
  }

  // Chỉ hiện đầu sách còn bản sẵn có, đúng như gợi ý trong form.
  const candidates = books.filter((b) => b.available > 0);

  const bookOptions: IssueOption[] = await Promise.all(
    candidates.map(async (book) => {
      const copies = await listBookCopies(book.id);
      const taken = takenByBook.get(book.id) ?? new Set<string>();
      return {
        book,
        copies: copies.map((c) => ({
          id: c.id,
          copyLabel: c.copyLabel,
          taken: taken.has(c.id),
        })),
      };
    }),
  );

  // Hồ sơ rút gọn cho mỗi hội viên: đang mượn, quá hạn, nợ phí.
  const memberOptions: IssueMember[] = members.map((m) => {
    const own = loans.filter(
      (l) => l.memberId === m.id && !l.returnedAt,
    );
    const overdue = own.filter((l) => l.status === "overdue");
    const overdueFine = overdue.reduce(
      (s, l) =>
        s + computeFine(daysLate(l.dueAt, today), settings.finePerDay),
      0,
    );
    return {
      ...m,
      activeCount: own.length,
      overdueCount: overdue.length,
      overdueFine,
    };
  });

  return (
    <AppShell>
      <PageHead
        title="Cho mượn"
        meta={`${candidates.length} đầu sách còn bản sẵn có, ${memberOptions.length} thẻ hội viên`}
        actions={
          <Link className="btn btn-quiet" href="/loans">
            Quay lại danh sách phiếu
          </Link>
        }
      />

      <IssueForm
        bookOptions={bookOptions}
        memberOptions={memberOptions}
        loanDays={settings.loanDays}
        finePerDay={settings.finePerDay}
      />
    </AppShell>
  );
}
