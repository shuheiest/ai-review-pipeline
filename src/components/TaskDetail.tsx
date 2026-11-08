"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { api, errorMessage } from "@/client/api";
import { STATUS_LABEL, formatDateTime } from "@/client/labels";
import { DeleteButton } from "@/components/DeleteButton";
import { TaskForm, type TaskFormValues } from "@/components/TaskForm";
import { STATUSES, type Status, type Task } from "@/server/domain/task/task";

// GET / PATCH はどれも Task を返すので、その型を 1 つ取っておく
type TaskResponse = Awaited<ReturnType<(typeof api)[":id"]["$get"]>>;

// 1 件取得。見つからない（404）ときは missing を立てる
function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    api[":id"]
      .$get({ param: { id } })
      .then(async (res: TaskResponse) => (res.ok ? setTask(await res.json()) : setMissing(true)));
  }, [id]);
  return { task, setTask, missing };
}

export function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { task, setTask, missing } = useTask(id);
  const [error, setError] = useState("");

  async function apply(pending: Promise<TaskResponse>) {
    const res = await pending;
    if (!res.ok) return setError(await errorMessage(res));
    setTask(await res.json());
    setError("");
  }

  const save = (values: TaskFormValues) => apply(api[":id"].$patch({ param: { id }, json: values }));
  const changeStatus = (status: Status) =>
    apply(api[":id"].status.$patch({ param: { id }, json: { status } }));
  async function remove() {
    const res = await api[":id"].$delete({ param: { id } });
    if (!res.ok) return setError(await errorMessage(res));
    router.push("/");
  }

  if (missing) return <NotFound />;
  if (!task) return <p className="description">読み込み中…</p>;
  return (
    <main>
      <Link href="/" className="back">
        ← 一覧へ戻る
      </Link>
      <h1 className="page-title">{task.title}</h1>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
      <section className="section">
        <h2 className="section-title">ステータス</h2>
        <div className="field form">
          <label className="label" htmlFor="status">
            現在のステータス
          </label>
          <select
            id="status"
            className="select"
            value={task.status}
            onChange={(e) => changeStatus(e.target.value as Status)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <p className="meta">完了日時：{task.completedAt ? formatDateTime(task.completedAt) : "未完了"}</p>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">項目の編集</h2>
        <TaskForm key={task.updatedAt} initial={task} submitLabel="変更を保存する" onSubmit={save} />
      </section>
      <section className="section">
        <h2 className="section-title">削除</h2>
        <DeleteButton onConfirm={remove} />
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main>
      <Link href="/" className="back">
        ← 一覧へ戻る
      </Link>
      <h1 className="page-title">タスクが見つかりません</h1>
      <p className="description">削除されたか、URL が間違っている可能性があります。</p>
    </main>
  );
}
