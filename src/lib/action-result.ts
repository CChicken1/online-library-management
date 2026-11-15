/**
 * Kiểu dữ liệu dùng chung cho Server Actions.
 *
 * File này cố ý KHÔNG có "use server": một module "use server" chỉ được
 * export các hàm async, nên hằng số và kiểu dữ liệu phải nằm ở đây.
 */

export type ActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

/** Trạng thái rỗng dùng làm giá trị ban đầu cho useActionState. */
export const EMPTY_RESULT: ActionResult = { ok: false, message: "" };
