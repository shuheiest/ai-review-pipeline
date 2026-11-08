import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetDb } from "./db";
import { createTask, del, get, patch, patchStatus, post, task, tasks } from "./helpers";

// docs/test-cases.md 2（ST-05〜10、ST-31）。作成・取得・更新・一覧・削除
beforeEach(resetDb);
afterEach(() => vi.useRealTimers());

describe("作成・取得・更新・削除", () => {
  it("ST-05 title だけで作成すると初期値が入り、1 件取得でも同じ内容が返る", async () => {
    const res = await post({ title: "買い物" });

    expect(res.status).toBe(201);
    const created = await task(res);
    expect(created.id).toEqual(expect.any(String));
    expect(created.status).toBe("todo");
    expect(created.priority).toBe("medium");
    expect(created.dueDate).toBeNull();
    expect(created.completedAt).toBeNull();
    expect(created.createdAt).toEqual(expect.any(String));
    expect(created.updatedAt).toEqual(expect.any(String));
    const fetched = await get(`/${created.id}`);
    expect(fetched.status).toBe(200);
    expect(await task(fetched)).toEqual(created);
  });

  it("ST-06 タイトル・期限・優先度を更新すると、ステータスはそのままで 3 つが変わる", async () => {
    const created = await createTask();
    const changes = { title: "掃除", dueDate: "2030-01-01", priority: "high" };

    const res = await patch(created.id, changes);

    expect(res.status).toBe(200);
    const updated = await task(res);
    expect(updated).toMatchObject({ ...changes, status: "todo" });
    expect(await task(await get(`/${created.id}`))).toEqual(updated);
  });

  it("ST-07 dueDate に null を送ると期限が消える", async () => {
    const created = await createTask({ title: "買い物", dueDate: "2030-01-01" });

    const res = await patch(created.id, { dueDate: null });

    expect(res.status).toBe(200);
    expect((await task(res)).dueDate).toBeNull();
  });

  it("ST-08 一覧を status と priority で絞り込める", async () => {
    await createTask({ title: "a", priority: "high" });
    await createTask({ title: "b", priority: "low" });
    const c = await createTask({ title: "c", priority: "high" });
    await patchStatus(c.id, { status: "done" });

    const all = await tasks(await get());
    const todo = await tasks(await get("?status=todo"));
    const high = await tasks(await get("?priority=high"));
    const both = await tasks(await get("?status=todo&priority=high"));

    expect(all).toHaveLength(3);
    expect(todo).toHaveLength(2);
    expect(high).toHaveLength(2);
    expect(both).toHaveLength(1);
    expect(both[0].title).toBe("a");
  });

  it("ST-09 削除すると 204 で、取得は 404 になり、一覧からも消える", async () => {
    const created = await createTask();

    const res = await del(created.id);

    expect(res.status).toBe(204);
    expect((await get(`/${created.id}`)).status).toBe(404);
    expect(await tasks(await get())).toHaveLength(0);
  });

  it("ST-10 タイトルの前後の空白は除かれて保存される", async () => {
    const res = await post({ title: "  買い物  " });

    expect(res.status).toBe(201);
    const created = await task(res);
    expect(created.title).toBe("買い物");
    expect((await task(await get(`/${created.id}`))).title).toBe("買い物");
  });

  it("ST-31 「今日」は日本時間で判定する（UTC では前日でも日本時間の今日は通る）", async () => {
    // UTC 2026-11-07 15:30 = 日本時間 2026-11-08 00:30
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-07T15:30:00Z"));

    const today = await post({ title: "t", dueDate: "2026-11-08" });
    const yesterday = await post({ title: "t", dueDate: "2026-11-07" });

    expect(today.status).toBe(201);
    expect(yesterday.status).toBe(400);
  });
});
