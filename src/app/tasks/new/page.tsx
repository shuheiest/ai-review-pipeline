"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/client/api";
import { TaskForm, type TaskFormValues } from "@/components/TaskForm";

export default function Page() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(values: TaskFormValues) {
    const res = await api.$post({ json: { ...values, dueDate: values.dueDate ?? undefined } });
    if (!res.ok) return setError(await errorMessage(res));
    router.push("/");
  }

  return (
    <main className="narrow">
      <Link href="/" className="back">
        ← 一覧へ戻る
      </Link>
      <h1 className="page-title">タスクを作成</h1>
      <p className="description">タイトルを入れて「作成する」を押すと、未着手のタスクとして追加されます。</p>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
      <TaskForm submitLabel="作成する" onSubmit={submit} />
    </main>
  );
}
