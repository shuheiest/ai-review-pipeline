import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "./db";
import { createTask, del, error, get, patch, patchStatus, post, task } from "./helpers";
import app from "@/server/routes/tasks";

// docs/test-cases.md 2-1（ST-11〜30）。直接 API を叩かれて不正な値が来たとき
beforeEach(resetDb);
afterEach(() => vi.useRealTimers());

describe("作成（POST /api/tasks）の不正な入力", () => {
  it("ST-11 title がないと 400 で、error にメッセージが入る", async () => {
    const res = await post({});

    expect(res.status).toBe(400);
    expect((await error(res)).error).toEqual(expect.any(String));
  });

  it.each([
    ["ST-12", "title が文字列でない", { title: 123 }],
    ["ST-13", "title が 51 文字", { title: "a".repeat(51) }],
    ["ST-14", "title が空白だけ", { title: "   " }],
    ["ST-15", "dueDate の形式が違う", { title: "t", dueDate: "2026/12/01" }],
    ["ST-16", "dueDate が存在しない日付", { title: "t", dueDate: "2026-02-30" }],
    ["ST-18", "priority が決められた値以外", { title: "t", priority: "urgent" }],
    ["ST-19", "status を含めている", { title: "t", status: "done" }],
  ])("%s %s は 400", async (_id, _label, body) => {
    const res = await post(body);

    expect(res.status).toBe(400);
  });

  it("ST-17 過去の dueDate は 400（今日 = 2026-11-08）", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-08T03:00:00Z"));

    const res = await post({ title: "t", dueDate: "2026-11-07" });

    expect(res.status).toBe(400);
  });

  it("ST-20 JSON として壊れた本文は 400", async () => {
    const res = await app.request("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ title: ",
    });

    expect(res.status).toBe(400);
  });
});

describe("更新（PATCH /api/tasks/:id）の不正な入力", () => {
  it.each([
    ["ST-21", "priority が決められた値以外", { priority: "urgent" }],
    ["ST-22", "title が空", { title: "" }],
    ["ST-24", "status を含めている", { status: "done" }],
  ])("%s %s は 400", async (_id, _label, body) => {
    const created = await createTask();

    const res = await patch(created.id, body);

    expect(res.status).toBe(400);
  });

  it("ST-23 更新時は過去の dueDate も通り、値が更新される", async () => {
    const created = await createTask();

    const res = await patch(created.id, { dueDate: "2020-01-01" });

    expect(res.status).toBe(200);
    expect((await task(res)).dueDate).toBe("2020-01-01");
  });
});

describe("ステータス変更（PATCH /api/tasks/:id/status）の不正な入力", () => {
  it.each([
    ["ST-25", "status が決められた値以外", { status: "closed" }],
    ["ST-26", "status がない", {}],
  ])("%s %s は 400", async (_id, _label, body) => {
    const created = await createTask();

    const res = await patchStatus(created.id, body);

    expect(res.status).toBe(400);
  });

  it("ST-27 done から todo への変更は 409 で、ステータスは done のまま", async () => {
    const created = await createTask();
    await patchStatus(created.id, { status: "done" });

    const res = await patchStatus(created.id, { status: "todo" });

    expect(res.status).toBe(409);
    expect((await error(res)).error).toEqual(expect.any(String));
    expect((await task(await get(`/${created.id}`))).status).toBe("done");
  });
});

describe("一覧の絞り込みと存在しない id", () => {
  it.each([
    ["ST-28", "status=closed", "?status=closed"],
    ["ST-29", "priority=urgent", "?priority=urgent"],
  ])("%s 絞り込みの値が不正（%s）なら 400", async (_id, _label, query) => {
    const res = await get(query);

    expect(res.status).toBe(400);
  });

  it("ST-30 存在しない id では GET・PATCH・ステータス変更・DELETE のいずれも 404", async () => {
    const id = "no-such-id";

    const statuses = await Promise.all([
      get(`/${id}`),
      patch(id, { title: "t" }),
      patchStatus(id, { status: "done" }),
      del(id),
    ]).then((rs) => rs.map((r) => r.status));

    expect(statuses).toEqual([404, 404, 404, 404]);
  });
});
