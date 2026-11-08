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

export function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api[":id"]
      .$get({ param: { id } })
      .then((res: TaskResponse) => res.json())
      .then(setTask);
  }, [id]);

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
    await api[":id"].$delete({ param: { id } });
    router.push("/");
  }

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
