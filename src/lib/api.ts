import { createClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/supabase/database.types";
import type {
  Book,
  BookCopy,
  Fine,
  LibrarySettings,
  Loan,
  LoanStatus,
  Member,
  Reservation,
} from "@/lib/types";
import {
  addDays,
  computeFine,
  daysLate,
  isMembershipValid,
  todayISO,
} from "@/lib/types";

/* ==========================================================================
   Lớp truy cập dữ liệu.
   Mọi truy vấn Supabase nằm trong file này. Giao diện chỉ dùng các hàm
   xuất ra, nên khi đổi nguồn dữ liệu thì giao diện không phải sửa.
   ========================================================================== */

type MemberRow = Tables<"members">;
type BookRow = Tables<"books">;
type BookStockRow = Tables<"book_stock">;
type CopyRow = Tables<"book_copies">;
type LoanRow = Tables<"loans">;
type FineRow = Tables<"fines">;
type ReservationRow = Tables<"reservations">;

const DEFAULT_SETTINGS: LibrarySettings = {
  name: "Thư viện Trung tâm",
  loanDays: 14,
  finePerDay: 17000,
  maxRenewals: 1,
};

/* --------------------------------------------------------------------------
   Cấu hình thư viện
   -------------------------------------------------------------------------- */

export async function getSettings(): Promise<LibrarySettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_settings")
    .select("name, loan_days, fine_per_day, max_renewals")
    .eq("id", true)
    .maybeSingle();

  if (!data) return DEFAULT_SETTINGS;

  return {
    name: data.name,
    loanDays: data.loan_days,
    finePerDay: data.fine_per_day,
    maxRenewals: data.max_renewals,
  };
}

/* --------------------------------------------------------------------------
   Sách
   -------------------------------------------------------------------------- */

function toBook(r: BookStockRow): Book {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    author: r.author,
    subject: r.subject,
    publisher: r.publisher,
    year: r.publish_year,
    pages: r.page_count,
    shelf: r.shelf,
    keywords: r.keywords,
    summary: r.summary,
    copies: r.total_copies,
    available: r.available_copies,
    coverTitle: r.title,
  };
}

export type BookQuery = {
  search?: string;
  subject?: string;
  shelf?: string;
  onlyAvailable?: boolean;
};

export async function listBooks(q: BookQuery = {}): Promise<Book[]> {
  const supabase = await createClient();
  let query = supabase.from("book_stock").select("*");

  if (q.onlyAvailable) query = query.gt("available_copies", 0);
  if (q.subject && q.subject !== "all") query = query.eq("subject", q.subject);
  if (q.shelf && q.shelf !== "all") query = query.eq("shelf", q.shelf);

  const { data, error } = await query.order("title");
  if (error) throw error;

  let rows = (data ?? []) as BookStockRow[];

  const needle = q.search?.trim().toLowerCase();
  if (needle) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.author.toLowerCase().includes(needle) ||
        r.code.toLowerCase().includes(needle),
    );
  }

  return rows.map(toBook);
}

export async function getBook(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_stock")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toBook(data as BookStockRow) : null;
}

export async function listBookCopies(bookId: string): Promise<BookCopy[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_copies")
    .select("id, book_id, copy_label, condition, acquired_on")
    .eq("book_id", bookId)
    .order("copy_label");

  if (error) throw error;

  return ((data ?? []) as CopyRow[]).map((c) => ({
    id: c.id,
    bookId: c.book_id,
    copyLabel: c.copy_label,
    condition: c.condition,
    acquiredOn: c.acquired_on,
  }));
}

export async function listSubjects(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("books").select("subject");
  return Array.from(new Set((data ?? []).map((b) => b.subject))).sort();
}

export async function listShelves(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("shelf")
    .not("shelf", "is", null);
  return Array.from(
    new Set((data ?? []).map((b) => b.shelf as string)),
  ).sort();
}

/* --------------------------------------------------------------------------
   Hội viên
   -------------------------------------------------------------------------- */

function toMember(r: MemberRow, activeLoans: number): Member {
  return {
    id: r.id,
    code: r.card_code,
    name: r.full_name,
    tier: r.tier,
    email: r.email,
    phone: r.phone,
    joinedAt: r.joined_on,
    expiryDate: r.expires_on,
    status: r.status,
    maxBooks: r.max_books,
    borrowCount: activeLoans,
  };
}

export async function listMembers(search = ""): Promise<Member[]> {
  const supabase = await createClient();

  const [membersRes, loansRes] = await Promise.all([
    supabase.from("members").select("*").order("full_name"),
    supabase.from("loans").select("member_id").is("returned_on", null),
  ]);

  if (membersRes.error) throw membersRes.error;

  const counts = new Map<string, number>();
  for (const l of loansRes.data ?? []) {
    counts.set(l.member_id, (counts.get(l.member_id) ?? 0) + 1);
  }

  const needle = search.trim().toLowerCase();
  let rows = (membersRes.data ?? []) as MemberRow[];
  if (needle) {
    rows = rows.filter(
      (r) =>
        r.full_name.toLowerCase().includes(needle) ||
        r.card_code.includes(needle) ||
        (r.email ?? "").toLowerCase().includes(needle),
    );
  }

  return rows.map((r) => toMember(r, counts.get(r.id) ?? 0));
}

export async function getMember(id: string): Promise<Member | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { count } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: true })
    .eq("member_id", id)
    .is("returned_on", null);

  return toMember(data as MemberRow, count ?? 0);
}

export type MemberInput = {
  fullName: string;
  email: string | null;
  phone: string | null;
  tier: Member["tier"];
  maxBooks: number;
  joinedOn: string;
  expiresOn: string;
  status: Member["status"];
  notes: string | null;
};

export async function createMember(input: MemberInput): Promise<string> {
  const supabase = await createClient();

  // Mã thẻ tự tăng: lấy số lớn nhất rồi cộng 1, định dạng 4 chữ số.
  const { data: last } = await supabase
    .from("members")
    .select("card_code")
    .order("card_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNum = last ? Number(last.card_code) + 1 : 1000;
  const cardCode = String(nextNum).padStart(4, "0");

  const { data, error } = await supabase
    .from("members")
    .insert({
      card_code: cardCode,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      tier: input.tier,
      max_books: input.maxBooks,
      joined_on: input.joinedOn,
      expires_on: input.expiresOn,
      status: input.status,
      notes: input.notes,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateMember(
  id: string,
  input: MemberInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      tier: input.tier,
      max_books: input.maxBooks,
      joined_on: input.joinedOn,
      expires_on: input.expiresOn,
      status: input.status,
      notes: input.notes,
    })
    .eq("id", id);

  if (error) throw error;
}

/* --------------------------------------------------------------------------
   Phiếu mượn
   -------------------------------------------------------------------------- */

/** Phiếu mượn kèm quan hệ. */
export type LoanWithRefs = LoanRow & {
  book_copies: { copy_label: string } | null;
  books: { title: string; author: string } | null;
  members: { card_code: string; full_name: string } | null;
};

function toLoan(r: LoanWithRefs, today: string): Loan {
  const late = !r.returned_on && daysLate(r.due_on, today) > 0;
  const status: LoanStatus = r.returned_on
    ? "returned"
    : late
      ? "overdue"
      : "borrowed";

  return {
    id: r.id,
    receiptCode: r.receipt_code,
    bookId: r.book_id,
    copyId: r.copy_id,
    memberId: r.member_id,
    borrowedAt: r.borrowed_on,
    dueAt: r.due_on,
    returnedAt: r.returned_on,
    status,
    copyLabel: r.book_copies?.copy_label ?? "",
    fineAmount: r.fine_amount,
  };
}

const LOAN_SELECT = `
  id, receipt_code, book_id, copy_id, member_id,
  borrowed_on, due_on, returned_on, fine_amount,
  book_copies ( copy_label ),
  books ( title, author ),
  members ( card_code, full_name )
`;

export async function listLoans(today = todayISO()): Promise<Loan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select(LOAN_SELECT)
    .order("borrowed_on", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as LoanWithRefs[]).map((r) =>
    toLoan(r, today),
  );
}

export async function getLoan(id: string): Promise<Loan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loans")
    .select(LOAN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data
    ? toLoan(data as unknown as LoanWithRefs, todayISO())
    : null;
}

export type IssueInput = {
  bookId: string;
  copyId: string;
  memberId: string;
  note?: string;
};

export type IssueResult =
  | { ok: true; receiptCode: string; dueOn: string }
  | { ok: false; reason: string };

/**
 * Tạo phiếu mượn. Kiểm tra toàn bộ điều kiện nghiệp vụ trước khi ghi.
 */
export async function issueLoan(
  input: IssueInput,
): Promise<IssueResult> {
  const supabase = await createClient();
  const settings = await getSettings();
  const today = todayISO();

  const [{ data: book }, { data: member }, { data: copy }] = await Promise.all([
    supabase
      .from("books")
      .select("id, title")
      .eq("id", input.bookId)
      .maybeSingle(),
    supabase
      .from("members")
      .select("id, full_name, tier, max_books, expires_on, status")
      .eq("id", input.memberId)
      .maybeSingle(),
    supabase
      .from("book_copies")
      .select("id, book_id, copy_label")
      .eq("id", input.copyId)
      .maybeSingle(),
  ]);

  if (!book) return { ok: false, reason: "Không tìm thấy đầu sách." };
  if (!member) return { ok: false, reason: "Không tìm thấy hội viên." };
  if (!copy || copy.book_id !== input.bookId) {
    return { ok: false, reason: "Bản vật lý không thuộc đầu sách này." };
  }
  if (member.status !== "active") {
    return {
      ok: false,
      reason: `Thẻ của ${member.full_name} đang bị tạm khoá.`,
    };
  }
  if (!isMembershipValid(member.expires_on, today)) {
    return {
      ok: false,
      reason: `Thẻ của ${member.full_name} đã hết hạn ngày ${member.expires_on}.`,
    };
  }

  // Bản vật lý này đã có phiếu chưa trả chưa.
  const { data: openOnCopy } = await supabase
    .from("loans")
    .select("id")
    .eq("copy_id", input.copyId)
    .is("returned_on", null)
    .maybeSingle();

  if (openOnCopy) {
    return {
      ok: false,
      reason: `Bản ${copy.copy_label} đang được mượn. Chọn bản khác.`,
    };
  }

  // Số cuốn đang mượn của hội viên.
  const { count: activeCount } = await supabase
    .from("loans")
    .select("id", { count: "exact", head: true })
    .eq("member_id", input.memberId)
    .is("returned_on", null);

  const active = activeCount ?? 0;
  if (active >= member.max_books) {
    return {
      ok: false,
      reason: `${member.full_name} đang mượn ${active} trên ${member.max_books} cuốn, đã đạt hạn mức.`,
    };
  }

  // Còn sách trễ hạn chưa thu phí thì không cho mượn tiếp.
  const { data: overdue } = await supabase
    .from("loans")
    .select("id, due_on")
    .eq("member_id", input.memberId)
    .is("returned_on", null)
    .lt("due_on", today);

  if (overdue && overdue.length > 0) {
    const total = overdue.reduce(
      (s, l) =>
        s + computeFine(daysLate(l.due_on, today), settings.finePerDay),
      0,
    );
    return {
      ok: false,
      reason: `${member.full_name} còn ${overdue.length} cuốn quá hạn, nợ ${total.toLocaleString("vi-VN")} đ. Cần thu phí trước.`,
    };
  }

  const dueOn = addDays(today, settings.loanDays);
  const receiptCode = await nextReceiptCode(supabase, today);

  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.from("loans").insert({
    receipt_code: receiptCode,
    book_id: input.bookId,
    copy_id: input.copyId,
    member_id: input.memberId,
    borrowed_on: today,
    due_on: dueOn,
    fine_amount: 0,
    note: input.note ?? null,
    created_by: userData.user?.id ?? null,
  });

  if (error) throw error;

  await writeAudit(supabase, "issue", "loan", receiptCode, {
    book: book.title,
    member: member.full_name,
    dueOn,
  });

  return { ok: true, receiptCode, dueOn };
}

/** Mã phiếu dạng PM-YYYYMMDD-XXX, XXX tăng dần trong ngày. */
async function nextReceiptCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  today: string,
): Promise<string> {
  const stamp = today.replace(/-/g, "");
  const { data } = await supabase
    .from("loans")
    .select("receipt_code")
    .like("receipt_code", `PM-${stamp}-%`)
    .order("receipt_code", { ascending: false })
    .limit(1)
    .maybeSingle();

  const last = data?.receipt_code;
  const seq = last ? Number(last.split("-")[2]) + 1 : 100;
  return `PM-${stamp}-${String(seq).padStart(3, "0")}`;
}

/** Nhận lại sách, tính phí trễ hạn nếu có. */
export async function returnLoan(
  loanId: string,
): Promise<{ ok: boolean; reason?: string; fine?: number }> {
  const supabase = await createClient();
  const settings = await getSettings();
  const today = todayISO();

  const { data: loan, error: readErr } = await supabase
    .from("loans")
    .select("id, receipt_code, due_on, returned_on, member_id, copy_id")
    .eq("id", loanId)
    .maybeSingle();

  if (readErr) throw readErr;
  if (!loan) return { ok: false, reason: "Không tìm thấy phiếu." };
  if (loan.returned_on) {
    return { ok: false, reason: "Phiếu này đã được trả." };
  }

  const late = daysLate(loan.due_on, today);
  const fine = computeFine(late, settings.finePerDay);

  const { error } = await supabase
    .from("loans")
    .update({ returned_on: today, fine_amount: fine })
    .eq("id", loanId);

  if (error) throw error;

  if (fine > 0) {
    await supabase.from("fines").insert({
      loan_id: loanId,
      member_id: loan.member_id,
      days_late: late,
      amount: fine,
      paid: false,
    });
  }

  await writeAudit(supabase, "return", "loan", loan.receipt_code, {
    lateDays: late,
    fine,
  });

  return { ok: true, fine };
}

/** Gia hạn một phiếu, chỉ khi còn trong hạn. */
export async function renewLoan(
  loanId: string,
): Promise<{ ok: boolean; reason?: string; dueOn?: string }> {
  const supabase = await createClient();
  const settings = await getSettings();
  const today = todayISO();

  const { data: loan, error: readErr } = await supabase
    .from("loans")
    .select("id, receipt_code, due_on, returned_on")
    .eq("id", loanId)
    .maybeSingle();

  if (readErr) throw readErr;
  if (!loan) return { ok: false, reason: "Không tìm thấy phiếu." };
  if (loan.returned_on) {
    return { ok: false, reason: "Phiếu đã trả, không gia hạn được." };
  }
  if (daysLate(loan.due_on, today) > 0) {
    return { ok: false, reason: "Phiếu đã quá hạn, cần thu phí rồi mượn lại." };
  }

  const dueOn = addDays(loan.due_on, settings.loanDays);
  const { error } = await supabase
    .from("loans")
    .update({ due_on: dueOn })
    .eq("id", loanId);

  if (error) throw error;

  await writeAudit(supabase, "renew", "loan", loan.receipt_code, { dueOn });
  return { ok: true, dueOn };
}

/* --------------------------------------------------------------------------
   Phí trễ hạn và đặt trước
   -------------------------------------------------------------------------- */

export async function listFines(): Promise<Fine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FineRow[]).map((f) => ({
    id: f.id,
    loanId: f.loan_id,
    memberId: f.member_id,
    daysLate: f.days_late,
    amount: f.amount,
    paid: f.paid,
    paidAt: f.paid_on,
  }));
}

export async function markFinePaid(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fines")
    .update({ paid: true, paid_on: todayISO() })
    .eq("id", id);

  if (error) throw error;
}

export async function listReservations(): Promise<Reservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("reserved_on");

  if (error) throw error;

  return ((data ?? []) as ReservationRow[]).map((r) => ({
    id: r.id,
    bookId: r.book_id,
    memberId: r.member_id,
    reservedAt: r.reserved_on,
    status: r.status,
  }));
}

export async function createReservation(
  bookId: string,
  memberId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .insert({ book_id: bookId, member_id: memberId, status: "waiting" });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, reason: "Hội viên này đã đặt trước cuốn sách đó." };
    }
    throw error;
  }
  return { ok: true };
}

/* --------------------------------------------------------------------------
   Thống kê
   -------------------------------------------------------------------------- */

export async function getStats() {
  const supabase = await createClient();
  const today = todayISO();

  const [booksRes, copiesRes, loansRes, membersRes] = await Promise.all([
    supabase.from("books").select("id, subject"),
    supabase.from("book_copies").select("id"),
    supabase.from("loans").select("id, book_id, due_on, returned_on"),
    supabase.from("members").select("id, expires_on, max_books"),
  ]);

  if (booksRes.error) throw booksRes.error;

  const bookRows = (booksRes.data ?? []) as { id: string; subject: string }[];
  const totalCopies = (copiesRes.data ?? []).length;
  const loanRows = (loansRes.data ?? []) as {
    id: string;
    book_id: string;
    due_on: string;
    returned_on: string | null;
  }[];

  const active = loanRows.filter((l) => !l.returned_on);
  const overdue = active.filter((l) => daysLate(l.due_on, today) > 0);
  const dueToday = active.filter((l) => l.due_on === today);

  const bySubject = new Map<string, number>();
  for (const b of bookRows) {
    bySubject.set(b.subject, (bySubject.get(b.subject) ?? 0) + 1);
  }

  const borrowCount = new Map<string, number>();
  for (const l of loanRows) {
    borrowCount.set(l.book_id, (borrowCount.get(l.book_id) ?? 0) + 1);
  }

  const memberRows = (membersRes.data ?? []) as {
    id: string;
    expires_on: string;
    max_books: number;
  }[];
  const expiring = memberRows.filter((m) => {
    const d = daysLeftLocal(m.expires_on, today);
    return d >= 0 && d <= 60;
  });

  return {
    totalBooks: bookRows.length,
    totalCopies,
    activeLoans: active.length,
    overdueLoans: overdue.length,
    dueToday: dueToday.length,
    members: memberRows.length,
    expiringMembers: expiring.length,
    bySubject: Array.from(bySubject.entries()).map(([subject, count]) => ({
      subject,
      count,
    })),
    borrowCount: Array.from(borrowCount.entries()).map(([bookId, count]) => ({
      bookId,
      count,
    })),
  };
}

function daysLeftLocal(due: string, today: string): number {
  return Math.floor(
    (new Date(due + "T00:00:00").getTime() -
      new Date(today + "T00:00:00").getTime()) /
      86_400_000,
  );
}

/* --------------------------------------------------------------------------
   Nhật ký
   -------------------------------------------------------------------------- */

async function writeAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  entity: string,
  entityId: string,
  detail: Record<string, unknown>,
) {
  const { data: userData } = await supabase.auth.getUser();
  await supabase.from("audit_log").insert({
    actor_id: userData.user?.id ?? null,
    action,
    entity,
    entity_id: entityId,
    detail: detail as Database["public"]["Tables"]["audit_log"]["Insert"]["detail"],
  });
}