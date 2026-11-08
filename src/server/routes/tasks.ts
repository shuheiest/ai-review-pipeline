import { Hono, type Context, type ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import type * as z from "zod";
import {
  changeStatusInput,
  createTaskInput,
  listTasksQuery,
  updateTaskInput,
} from "@/server/domain/task/validation";
import {
  UsecaseError,
  changeStatus,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "@/server/usecase/task";
import { today } from "@/server/usecase/today";

// 入力エラーも他のエラーも { error: string } の形に揃える。
// schema は、リクエストごとに作る必要があるもの（作成時の「今日」）は関数で渡す
const validate = <K extends keyof ValidationTargets, T extends z.ZodType>(
  target: K,
  schema: T | (() => T),
) =>
  validator(target, (value: unknown, c: Context): z.output<T> => {
    const result = (typeof schema === "function" ? schema() : schema).safeParse(value);
    if (result.success) return result.data;
    const error = result.error.issues.map((i) => i.message).join(", ");
    throw new HTTPException(400, { res: c.json({ error }, 400) });
  });

const app = new Hono()
  .basePath("/api")
  .onError((err, c) => {
    if (err instanceof HTTPException) return err.getResponse();
    if (err instanceof UsecaseError) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: "internal error" }, 500);
  })
  .get("/tasks", validate("query", listTasksQuery), async (c) =>
    c.json(await listTasks(c.req.valid("query"))),
  )
  .get("/tasks/:id", async (c) => c.json(await getTask(c.req.param("id"))))
  .post("/tasks", validate("json", () => createTaskInput(today())), async (c) =>
    c.json(await createTask(c.req.valid("json")), 201),
  )
  .patch("/tasks/:id", validate("json", updateTaskInput), async (c) =>
    c.json(await updateTask(c.req.param("id"), c.req.valid("json"))),
  )
  .patch("/tasks/:id/status", validate("json", changeStatusInput), async (c) =>
    c.json(await changeStatus(c.req.param("id"), c.req.valid("json").status)),
  )
  .delete("/tasks/:id", async (c) => {
    await deleteTask(c.req.param("id"));
    return c.body(null, 204);
  });

export type AppType = typeof app;
export default app;
