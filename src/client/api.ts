import { hc } from "hono/client";
import type { AppType } from "@/server/routes/tasks";

export const api = hc<AppType>("").api.tasks;

// サーバーは失敗時に必ず { error: string } を返す（src/server/routes/tasks.ts）
export async function errorMessage(res: Response): Promise<string> {
  const body = (await res.json()) as { error: string };
  return body.error;
}
