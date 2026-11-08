import type { Status } from "./task";

// docs/spec.md「3. ステータスの流れ」の表。キーが変更前、値が変更後として許されるもの。
// done → todo は入れない（やり直すときは、まず in_progress に戻す）。
const ALLOWED: Record<Status, readonly Status[]> = {
  todo: ["in_progress", "done"],
  in_progress: ["todo", "done"],
  done: ["in_progress"],
};

// unchanged: 同じステータス。変更なしとして扱い、エラーにしない
export type StatusChange = "unchanged" | "allowed" | "forbidden";

export function decideStatusChange(from: Status, to: Status): StatusChange {
  if (from === to) return "unchanged";
  return ALLOWED[from].includes(to) ? "allowed" : "forbidden";
}
