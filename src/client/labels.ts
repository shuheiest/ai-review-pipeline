import type { Priority, Status } from "@/server/domain/task/task";

// 画面に出す日本語。API の値（todo など）はそのまま、表示だけ変える
export const STATUS_LABEL: Record<Status, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
