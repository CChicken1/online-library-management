"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { createMemberAction } from "@/app/actions";
import { EMPTY_RESULT } from "@/app/actions";
import type { ActionResult } from "@/app/actions";

export function MemberForm() {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    createMemberAction,
    EMPTY_RESULT,
  );

  if (state?.ok) {
    return (
      <div className="notice is-ok">
        <Check size={15} strokeWidth={2.2} aria-hidden />
        <div>
          <strong>{state.message}</strong>
          <span>
            <Link href="/members">Quay lại danh sách hội viên</Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="form-card">
      <div className="field">
        <label htmlFor="fullName">Họ và tên</label>
        <input id="fullName" name="fullName" required placeholder="Nguyễn Văn A" />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="a@example.com" />
        </div>
        <div className="field">
          <label htmlFor="phone">Điện thoại</label>
          <input id="phone" name="phone" placeholder="090 000 0000" />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="tier">Hạng thẻ</label>
          <select id="tier" name="tier" defaultValue="Thường">
            <option value="Thường">Thường, tối đa 5 cuốn</option>
            <option value="Vàng">Vàng, tối đa 8 cuốn</option>
            <option value="Đọc tại chỗ">Đọc tại chỗ, không mượn</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="maxBooks">Hạn mức mượn</label>
          <input
            id="maxBooks"
            name="maxBooks"
            type="number"
            min={0}
            max={20}
            defaultValue={5}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="joinedOn">Ngày cấp thẻ</label>
          <input
            id="joinedOn"
            name="joinedOn"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="field">
          <label htmlFor="expiresOn">Ngày hết hạn</label>
          <input id="expiresOn" name="expiresOn" type="date" required />
        </div>
      </div>

      <div className="field">
        <label htmlFor="status">Trạng thái</label>
        <select id="status" name="status" defaultValue="active">
          <option value="active">Đang hoạt động</option>
          <option value="suspended">Tạm khoá</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="notes">Ghi chú</label>
        <textarea id="notes" name="notes" rows={3} placeholder="Ghi chú nội bộ" />
      </div>

      {state && !state.ok ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="form-actions">
        <SubmitButton />
        <Link className="btn btn-quiet" href="/members">
          Huỷ
        </Link>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Đang lưu" : "Cấp thẻ"}
    </button>
  );
}
