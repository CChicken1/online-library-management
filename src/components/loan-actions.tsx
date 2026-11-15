"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, RotateCcw } from "lucide-react";
import { returnLoanAction, renewLoanAction } from "@/app/actions";
import { EMPTY_RESULT } from "@/lib/action-result";

/**
 * Nút trả sách. Dùng useActionState để hiện kết quả ngay tại chỗ,
 * không cần chuyển trang.
 */
export function ReturnButton({
  loanId,
  receiptCode,
}: {
  loanId: string;
  receiptCode: string;
}) {
  const [state, formAction] = useActionState(returnLoanAction, EMPTY_RESULT);
  const [open, setOpen] = useState(false);

  if (state?.ok) {
    return (
      <span className="status is-ok-inline">
        <Check size={13} strokeWidth={2.4} aria-hidden />
        Đã trả
      </span>
    );
  }

  return (
    <>
      <button className="btn btn-quiet" onClick={() => setOpen(true)}>
        <RotateCcw size={12} strokeWidth={2} aria-hidden />
        Trả
      </button>

      {open ? (
        <div className="confirm" role="dialog" aria-label="Xác nhận trả sách">
          <p>
            Nhận lại sách <strong>{receiptCode}</strong>?
          </p>
          {state && !state.ok ? (
            <p className="form-error" role="alert">
              {state.message}
            </p>
          ) : null}
          <div className="confirm-actions">
            <form action={formAction}>
              <input type="hidden" name="loanId" value={loanId} />
              <ConfirmSubmit />
            </form>
            <button className="btn btn-quiet" onClick={() => setOpen(false)}>
              Huỷ
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Đang ghi" : "Xác nhận trả"}
    </button>
  );
}

/* ---------------- Gia hạn ---------------- */

export function RenewButton({ loanId }: { loanId: string }) {
  const [state, formAction] = useActionState(renewLoanAction, EMPTY_RESULT);

  if (state?.ok) {
    return (
      <span className="status is-ok-inline">
        <Check size={13} strokeWidth={2.4} aria-hidden />
        Đã gia hạn
      </span>
    );
  }

  return (
    <form action={formAction} className="inline-form">
      <input type="hidden" name="loanId" value={loanId} />
      <button className="btn btn-quiet" type="submit">
        Gia hạn
      </button>
      {state && !state.ok ? (
        <span className="form-error is-inline" role="alert">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}