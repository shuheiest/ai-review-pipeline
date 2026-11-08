import Link from "next/link";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/client/labels";
import type { Task } from "@/server/domain/task/task";

export function TaskTable({ tasks }: { tasks: Task[] | null }) {
  if (tasks === null) return <p className="description">読み込み中…</p>;
  if (tasks.length === 0) {
    return <p className="empty">タスクはまだありません。「タスクを作成」から追加できます。</p>;
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">タイトル</th>
            <th scope="col">ステータス</th>
            <th scope="col">優先度</th>
            <th scope="col">期限</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td data-label="タイトル">
                <Link href={`/tasks/${t.id}`}>{t.title}</Link>
              </td>
              <td data-label="ステータス">
                <span className={`chip chip-${t.status}`}>{STATUS_LABEL[t.status]}</span>
              </td>
              <td data-label="優先度">
                <span className={`priority-${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
              </td>
              <td data-label="期限" className="num">
                {t.dueDate ?? "なし"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
