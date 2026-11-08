import * as z from "zod";
import { PRIORITIES, STATUSES } from "./task";

// docs/spec.md「2. タスクの項目」の規則

const TITLE_MESSAGE = "タイトルは前後の空白を除いて1〜50文字で入力してください";
const DUE_DATE_MESSAGE = "期限は YYYY-MM-DD 形式の正しい日付で入力してください";
const PAST_DUE_DATE_MESSAGE = "期限に過去の日付は指定できません";

// ローカル日付の YYYY-MM-DD
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const title = z.string().trim().min(1, TITLE_MESSAGE).max(50, TITLE_MESSAGE);

// z.iso.date は 2026-02-30 のような存在しない日付も弾く
const dueDate = z.iso.date(DUE_DATE_MESSAGE);

// 作成時だけ過去を禁止。YYYY-MM-DD は文字列比較で日付順になる
const futureDueDate = dueDate.refine((d) => d >= today(), PAST_DUE_DATE_MESSAGE);

// strictObject: 決められていない項目（status など）が含まれていたら弾く
export const createTaskInput = z.strictObject({
  title,
  dueDate: futureDueDate.optional(),
  priority: z.enum(PRIORITIES).default("medium"),
});

export const updateTaskInput = z.strictObject({
  title: title.optional(),
  dueDate: dueDate.nullable().optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export const changeStatusInput = z.strictObject({
  status: z.enum(STATUSES),
});

export const listTasksQuery = z.object({
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type ListTasksQuery = z.infer<typeof listTasksQuery>;
