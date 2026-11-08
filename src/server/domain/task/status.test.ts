import { describe, expect, it } from "vitest";
import { decideStatusChange } from "./status";
import { STATUSES, type Status } from "./task";

// docs/test-cases.md 1-1。docs/spec.md「3. ステータスの流れ」の表
const transitions: [string, Status, Status, "allowed" | "forbidden"][] = [
  ["UT-01", "todo", "in_progress", "allowed"],
  ["UT-02", "todo", "done", "allowed"],
  ["UT-03", "in_progress", "todo", "allowed"],
  ["UT-04", "in_progress", "done", "allowed"],
  ["UT-05", "done", "in_progress", "allowed"],
  ["UT-06", "done", "todo", "forbidden"],
];

describe("decideStatusChange", () => {
  it.each(transitions)("%s %s → %s は %s", (_id, from, to, expected) => {
    const result = decideStatusChange(from, to);

    expect(result).toBe(expected);
  });

  it.each(STATUSES)("UT-07 %s → 同じステータスは変更なし（unchanged）", (status) => {
    const result = decideStatusChange(status, status);

    expect(result).toBe("unchanged");
  });
});
