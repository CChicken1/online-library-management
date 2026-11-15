"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMember,
  createReservation,
  issueLoan,
  markFinePaid,
  renewLoan,
  returnLoan,
  updateMember,
} from "@/lib/api";
import type { MemberInput } from "@/lib/api";

/* ==========================================================================
   Server Actions.
   Mọi thao tác ghi dữ liệu đi qua đây, để giao diện chỉ gọi hàm và
   không phải tự quản lý Supabase client.
   ========================================================================== */

export type ActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

/** Trạng thái rỗng dùng làm giá trị ban đầu cho useActionState. */
export const EMPTY_RESULT: ActionResult = { ok: false, message: "" };

/* ---------------- Đăng nhập / đăng ký ---------------- */

export async function signInAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Nhập đầy đủ email và mật khẩu." };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.fullName = "Cần nhập họ tên.";
  if (!email) fieldErrors.email = "Cần nhập email.";
  if (password.length < 8) fieldErrors.password = "Mật khẩu tối thiểu 8 ký tự.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Thiếu thông tin.", fieldErrors };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "User already registered"
          ? "Email này đã được đăng ký."
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/* ---------------- Cho mượn ---------------- */

export async function issueLoanAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const bookId = String(formData.get("bookId") ?? "");
  const copyId = String(formData.get("copyId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!bookId || !copyId || !memberId) {
    return { ok: false, message: "Cần chọn đầy đủ sách, bản vật lý và hội viên." };
  }

  try {
    const result = await issueLoan({ bookId, copyId, memberId, note });

    if (!result.ok) return { ok: false, message: result.reason };

    revalidatePath("/");
    revalidatePath("/loans");
    revalidatePath("/books");

    return {
      ok: true,
      message: `Đã tạo phiếu ${result.receiptCode}, hạn trả ${result.dueOn}.`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không tạo được phiếu mượn.",
    };
  }
}

export async function returnLoanAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const loanId = String(formData.get("loanId") ?? "");
  if (!loanId) return { ok: false, message: "Thiếu mã phiếu." };

  try {
    const result = await returnLoan(loanId);

    if (!result.ok) {
      return { ok: false, message: result.reason ?? "Không trả được sách." };
    }

    revalidatePath("/");
    revalidatePath("/loans");
    revalidatePath("/reports");

    return {
      ok: true,
      message:
        result.fine && result.fine > 0
          ? `Đã nhận lại sách. Phí trễ hạn ${result.fine.toLocaleString("vi-VN")} đ.`
          : "Đã nhận lại sách.",
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không trả được sách.",
    };
  }
}

export async function renewLoanAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const loanId = String(formData.get("loanId") ?? "");
  if (!loanId) return { ok: false, message: "Thiếu mã phiếu." };

  try {
    const result = await renewLoan(loanId);

    if (!result.ok) {
      return { ok: false, message: result.reason ?? "Không gia hạn được." };
    }

    revalidatePath("/loans");
    revalidatePath("/");

    return { ok: true, message: `Đã gia hạn, hạn trả mới ${result.dueOn}.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không gia hạn được.",
    };
  }
}

/* ---------------- Hội viên ---------------- */

export async function createMemberAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const input = readMemberForm(formData);
  if ("error" in input) return { ok: false, message: input.error };

  try {
    await createMember(input);
    revalidatePath("/members");
    return { ok: true, message: `Đã cấp thẻ ${input.fullName}.` };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không tạo được hội viên.",
    };
  }
}

export async function updateMemberAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const input = readMemberForm(formData);
  if ("error" in input) return { ok: false, message: input.error };
  if (!id) return { ok: false, message: "Thiếu mã hội viên." };

  try {
    await updateMember(id, input);
    revalidatePath("/members");
    return { ok: true, message: "Đã cập nhật hồ sơ hội viên." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không cập nhật được.",
    };
  }
}

/* ---------------- Phí và đặt trước ---------------- */

export async function payFineAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("fineId") ?? "");
  if (!id) return { ok: false, message: "Thiếu mã khoản phí." };

  try {
    await markFinePaid(id);
    revalidatePath("/loans");
    revalidatePath("/reports");
    return { ok: true, message: "Đã ghi nhận thu phí." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không ghi nhận được phí.",
    };
  }
}

export async function reserveBookAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const bookId = String(formData.get("bookId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  if (!bookId || !memberId) {
    return { ok: false, message: "Cần chọn sách và hội viên." };
  }

  try {
    const result = await createReservation(bookId, memberId);
    if (!result.ok) {
      return { ok: false, message: result.reason ?? "Không đặt trước được." };
    }
    revalidatePath("/books");
    return { ok: true, message: "Đã ghi nhận đặt trước." };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Không đặt trước được.",
    };
  }
}

/* ---------------- Đọc form ---------------- */

function readMemberForm(formData: FormData): MemberInput | { error: string } {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const tier = String(formData.get("tier") ?? "Thường") as MemberInput["tier"];
  const maxBooks = Number(formData.get("maxBooks") ?? 5);
  const expiresOn = String(formData.get("expiresOn") ?? "");

  if (!fullName) return { error: "Cần nhập họ tên." };
  if (!expiresOn) return { error: "Cần chọn ngày hết hạn thẻ." };

  return {
    fullName,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    tier,
    maxBooks: Number.isFinite(maxBooks) ? Math.max(0, maxBooks) : 5,
    joinedOn: String(formData.get("joinedOn") ?? "") || new Date().toISOString().slice(0, 10),
    expiresOn,
    status: String(formData.get("status") ?? "active") as MemberInput["status"],
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}