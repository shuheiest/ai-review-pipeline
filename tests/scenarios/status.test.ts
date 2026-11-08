import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "./db";
import { createTask, patchStatus, task } from "./helpers";

// docs/test-cases.md 2（ST-01〜04）。ステータスの流れと completedAt
beforeEach(resetDb);

describe("ステータスの流れ", () => {
  it("ST-01 作成して着手し、完了すると、完了日時が入る", async () => {
    const created = await createTask();
    expect(created.status).toBe("todo");
    expect(created.completedAt).toBeNull();

    const started = await patchStatus(created.id, { status: "in_progress" });
    const done = await patchStatus(created.id, { status: "done" });

    expect(started.status).toBe(200);
    const startedTask = await task(started);
    expect(startedTask.status).toBe("in_progress");
    expect(startedTask.completedAt).toBeNull();
    expect(done.status).toBe(200);
    const doneTask = await task(done);
    expect(doneTask.status).toBe("done");
    expect(doneTask.completedAt).not.toBeNull();
  });

  it("ST-02 完了したタスクを再オープンすると、完了日時が消える", async () => {
    const created = await createTask();
    const doneTask = await task(await patchStatus(created.id, { status: "done" }));
    expect(doneTask.completedAt).not.toBeNull();

    const res = await patchStatus(created.id, { status: "in_progress" });

    expect(res.status).toBe(200);
    const reopened = await task(res);
    expect(reopened.status).toBe("in_progress");
    expect(reopened.completedAt).toBeNull();
  });

  it("ST-03 着手せずに完了できる", async () => {
    const created = await createTask();

    const res = await patchStatus(created.id, { status: "done" });

    expect(res.status).toBe(200);
    const doneTask = await task(res);
    expect(doneTask.status).toBe("done");
    expect(doneTask.completedAt).not.toBeNull();
  });

  it("ST-04 同じステータスに変更してもエラーにならず、完了日時も変わらない", async () => {
    const created = await createTask();
    const first = await task(await patchStatus(created.id, { status: "done" }));

    const res = await patchStatus(created.id, { status: "done" });

    expect(res.status).toBe(200);
    const second = await task(res);
    expect(second.status).toBe("done");
    expect(second.completedAt).toBe(first.completedAt);
  });
});
