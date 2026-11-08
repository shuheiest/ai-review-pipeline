import * as z from "zod";
import { PRIORITIES, STATUSES } from "./task";

// docs/spec.md「2. タスクの項目」の規則。
// domain は純粋な関数だけにするため、現在時刻は読まない。「今日」は引数で受け取る。

const TITLE_MESSAGE = "タイトルは前後の空白を除いて1〜50文字で入力してください";
const DUE_DATE_MESSAGE = "期限は YYYY-MM-DD 形式の正しい日付で入力してください";
const PAST_DUE_DATE_MESSAGE = "期限に過去の日付は指定できません";

// 文字数は見た目の文字（書記素）で数える。結合した絵文字も 1 文字
const segmenter = new Intl.Segmenter();
const length = (s: string) => [...segmenter.segment(s)].length;
const title = z
  .string()
  .trim()
  .refine((s) => length(s) >= 1 && length(s) <= 50, TITLE_MESSAGE);

// z.iso.date は 2026-02-30 のような存在しない日付も弾く
const dueDate = z.iso.date(DUE_DATE_MESSAGE);

// strictObject: 決められていない項目（status など）が含まれていたら弾く

// 作成時だけ過去を禁止。today は YYYY-MM-DD。文字列比較で日付順になる
export const createTaskInput = (today: string) =>
  z.strictObject({
    title,
    dueDate: dueDate.refine((d) => d >= today, PAST_DUE_DATE_MESSAGE).optional(),
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

export type CreateTaskInput = z.infer<ReturnType<typeof createTaskInput>>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type ListTasksQuery = z.infer<typeof listTasksQuery>;
