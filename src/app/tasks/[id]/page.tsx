import { Suspense } from "react";
import { TaskDetail } from "@/components/TaskDetail";

// params を読む部分を Suspense で包まないと Next 16 の事前レンダリングが止まる
export default function Page({ params }: PageProps<"/tasks/[id]">) {
  return (
    <Suspense fallback={<p className="description">読み込み中…</p>}>
      <TaskDetail params={params} />
    </Suspense>
  );
}
