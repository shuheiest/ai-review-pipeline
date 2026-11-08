import type { Task } from "@/server/domain/task/task";
import app from "@/server/routes/tasks";

// Hono のアプリに直接リクエストを送る（サーバーは起動しない）
const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const post = (body: unknown) => app.request("/api/tasks", json("POST", body));
export const patch = (id: string, body: unknown) => app.request(`/api/tasks/${id}`, json("PATCH", body));
export const patchStatus = (id: string, body: unknown) =>
  app.request(`/api/tasks/${id}/status`, json("PATCH", body));
export const get = (path = "") => app.request(`/api/tasks${path}`);
export const del = (id: string) => app.request(`/api/tasks/${id}`, { method: "DELETE" });

export const task = (res: Response) => res.json() as Promise<Task>;
export const tasks = (res: Response) => res.json() as Promise<Task[]>;
export const error = (res: Response) => res.json() as Promise<{ error: string }>;

// 正常なタスクを 1 件作る。前提づくり用
export async function createTask(body: unknown = { title: "買い物" }): Promise<Task> {
  const res = await post(body);
  if (res.status !== 201) throw new Error(`前提のタスクを作れませんでした: ${res.status}`);
  return task(res);
}
