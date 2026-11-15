import { listBooks, listLoans, listMembers } from "@/lib/api";
import type { Book, Loan, Member } from "@/lib/types";

/**
 * Tải sẵn dữ liệu liên quan để tránh gọi lặp lặp trong JSX.
 * Trả về map theo id để tra cứu O(1).
 */
export async function loadIndex() {
  const [books, members, loans] = await Promise.all([
    listBooks(),
    listMembers(),
    listLoans(),
  ]);

  return {
    books,
    members,
    loans,
    bookById: new Map(books.map((b) => [b.id, b])),
    memberById: new Map(members.map((m) => [m.id, m])),
    loanById: new Map(loans.map((l) => [l.id, l])),
  };
}

export type Index = Awaited<ReturnType<typeof loadIndex>>;

/** Tên sách từ phiếu mượn. */
export function loanBookTitle(index: Index, loan: Loan): string {
  return index.bookById.get(loan.bookId)?.title ?? "Sách đã xoá";
}

/** Tên hội viên từ phiếu mượn. */
export function loanMemberName(index: Index, loan: Loan): string {
  return index.memberById.get(loan.memberId)?.name ?? "Hội viên đã xoá";
}

/** Số thẻ hội viên từ phiếu mượn. */
export function loanMemberCode(index: Index, loan: Loan): string {
  return index.memberById.get(loan.memberId)?.code ?? "";
}

/** Sách đang được mượn của một hội viên. */
export function memberActiveLoans(index: Index, memberId: string): Loan[] {
  return index.loans.filter((l) => l.memberId === memberId && !l.returnedAt);
}

/** Số cuốn đang mượn của hội viên. */
export function memberBorrowCount(index: Index, memberId: string): number {
  return memberActiveLoans(index, memberId).length;
}

/** Tổng phí trễ hạn đang nợ của hội viên. */
export function memberUnpaidFine(
  index: Index,
  memberId: string,
  finePerDay: number,
): number {
  const today = new Date().toISOString().slice(0, 10);
  return memberActiveLoans(index, memberId)
    .filter((l) => l.status === "overdue")
    .reduce((sum, l) => {
      const due = new Date(l.dueAt + "T00:00:00").getTime();
      const now = new Date(today + "T00:00:00").getTime();
      const late = Math.max(0, Math.floor((now - due) / 86_400_000));
      return sum + late * finePerDay;
    }, 0);
}

/** Sách mà hội viên đang mượn. */
export function memberBooks(index: Index, memberId: string): Book[] {
  return memberActiveLoans(index, memberId)
    .map((l) => index.bookById.get(l.bookId))
    .filter((b): b is Book => Boolean(b));
}

/** Hội viên từ phiếu mượn, có thể null. */
export function loanMember(index: Index, loan: Loan): Member | undefined {
  return index.memberById.get(loan.memberId);
}

/** Sách từ phiếu mượn, có thể null. */
export function loanBook(index: Index, loan: Loan): Book | undefined {
  return index.bookById.get(loan.bookId);
}
