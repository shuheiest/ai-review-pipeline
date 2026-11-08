"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/client/api";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/client/labels";
import { FilterSelect } from "@/components/FilterSelect";
import { TaskTable } from "@/components/TaskTable";
import { PRIORITIES, STATUSES, type Priority, type Status, type Task } from "@/server/domain/task/task";

export default function Page() {
  const [status, setStatus] = useState<Status | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = { status: status || undefined, priority: priority || undefined };
    api.$get({ query }).then(async (res) => {
      if (!res.ok) return setError(await errorMessage(res));
      setTasks(await res.json());
    });
  }, [status, priority]);

  return (
    <main>
      <div className="page-head">
        <h1 className="page-title">タスク一覧</h1>
        <Link href="/tasks/new" className="btn btn-primary">
          タスクを作成
        </Link>
      </div>
      <div className="filters">
        <FilterSelect
          id="filter-status"
          label="ステータス"
          options={STATUSES}
          labels={STATUS_LABEL}
          value={status}
          onChange={setStatus}
        />
        <FilterSelect
          id="filter-priority"
          label="優先度"
          options={PRIORITIES}
          labels={PRIORITY_LABEL}
          value={priority}
          onChange={setPriority}
        />
      </div>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
      <TaskTable tasks={tasks} />
    </main>
  );
}
