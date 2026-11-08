import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changeStatusInput, createTaskInput, listTasksQuery, updateTaskInput } from "./validation";

// docs/test-cases.md 1-2〜1-4。今日を 2026-11-08（ローカル時刻の正午）に固定する
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 8, 12, 0, 0));
});
afterEach(() => vi.useRealTimers());

const create = (input: unknown) => createTaskInput.safeParse(input).success;
const update = (input: unknown) => updateTaskInput.safeParse(input).success;

describe("1-2. タイトル", () => {
  it("UT-11 作成：前後に空白があっても通り、空白を除いた値になる", () => {
    const input = { title: "  買い物  " };

    const result = createTaskInput.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("買い物");
  });

  it.each([
    ["UT-12", "空文字", "", false],
    ["UT-13", "空白だけ", "   ", false],
    ["UT-14", "1 文字", "a", true],
    ["UT-15", "50 文字", "a".repeat(50), true],
    ["UT-16", "51 文字", "a".repeat(51), false],
    ["UT-17", "空白を除くと 50 文字", ` ${"a".repeat(50)} `, true],
    ["UT-19", "文字列でない値", 123, false],
  ])("%s 作成：%s は %s", (_id, _label, title, expected) => {
    const result = create({ title });

    expect(result).toBe(expected);
  });

  it("UT-18 作成：title を省略すると弾く", () => {
    const result = create({});

    expect(result).toBe(false);
  });

  it("UT-20 更新：title を省略しても通る", () => {
    const result = update({});

    expect(result).toBe(true);
  });

  it("UT-21 更新：空白だけは弾く", () => {
    const result = update({ title: "   " });

    expect(result).toBe(false);
  });
});

describe("1-3. 期限（今日 = 2026-11-08）", () => {
  it.each([
    ["UT-31", "昨日", "2026-11-07", false],
    ["UT-32", "今日", "2026-11-08", true],
    ["UT-33", "明日", "2026-11-09", true],
    ["UT-35", "区切りが違う", "2026/12/01", false],
    ["UT-36", "桁が足りない", "2026-12-1", false],
    ["UT-37", "存在しない日", "2026-02-30", false],
    ["UT-38", "存在しない月", "2026-13-01", false],
    ["UT-39", "うるう年の 2 月 29 日", "2028-02-29", true],
    ["UT-40", "うるう年でない 2 月 29 日", "2027-02-29", false],
  ])("%s 作成：%s（%s）は %s", (_id, _label, dueDate, expected) => {
    const result = create({ title: "t", dueDate });

    expect(result).toBe(expected);
  });

  it("UT-34 作成：dueDate を省略しても通る", () => {
    const result = create({ title: "t" });

    expect(result).toBe(true);
  });

  it.each([
    ["UT-41", "過去の日付", "2020-01-01", true],
    ["UT-42", "null（期限を消す）", null, true],
    ["UT-43", "形式が違う", "2026/12/01", false],
  ])("%s 更新：%s は %s", (_id, _label, dueDate, expected) => {
    const result = update({ dueDate });

    expect(result).toBe(expected);
  });
});

describe("1-4. 優先度・ステータスの値と、決められていない項目", () => {
  it("UT-51 作成：priority を省略すると medium になる", () => {
    const input = { title: "t" };

    const result = createTaskInput.parse(input);

    expect(result.priority).toBe("medium");
  });

  it.each(["low", "medium", "high"])("UT-52 作成：priority に %s は通る", (priority) => {
    const result = create({ title: "t", priority });

    expect(result).toBe(true);
  });

  it("UT-53 作成：priority に urgent は弾く", () => {
    const result = create({ title: "t", priority: "urgent" });

    expect(result).toBe(false);
  });

  it("UT-54 更新：priority に urgent は弾く", () => {
    const result = update({ priority: "urgent" });

    expect(result).toBe(false);
  });

  it.each(["todo", "in_progress", "done"])("UT-55 ステータス変更：%s は通る", (status) => {
    const result = changeStatusInput.safeParse({ status }).success;

    expect(result).toBe(true);
  });

  it.each([
    ["UT-56", "closed", { status: "closed" }],
    ["UT-57", "省略", {}],
  ])("%s ステータス変更：%s は弾く", (_id, _label, input) => {
    const result = changeStatusInput.safeParse(input).success;

    expect(result).toBe(false);
  });

  it.each([
    ["UT-58", "status=done&priority=high", { status: "done", priority: "high" }, true],
    ["UT-59", "status=closed", { status: "closed" }, false],
    ["UT-60", "priority=urgent", { priority: "urgent" }, false],
  ])("%s 一覧の絞り込み：%s は %s", (_id, _label, query, expected) => {
    const result = listTasksQuery.safeParse(query).success;

    expect(result).toBe(expected);
  });

  it("UT-61 作成：status を含めると弾く", () => {
    const result = create({ title: "t", status: "done" });

    expect(result).toBe(false);
  });

  it("UT-62 更新：status を含めると弾く", () => {
    const result = update({ status: "done" });

    expect(result).toBe(false);
  });

  it("UT-63 作成・更新：知らない項目を含めると弾く", () => {
    const created = create({ title: "t", foo: 1 });
    const updated = update({ foo: 1 });

    expect(created).toBe(false);
    expect(updated).toBe(false);
  });
});
