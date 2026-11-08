import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { TEST_DATABASE_URL, TEST_DB_PATH } from "./test-db";

// テスト用 SQLite を作り直してスキーマを反映する。テスト全体で 1 回だけ走る
export default function setup() {
  const url = process.env.DATABASE_URL;
  // 消してよいのはテスト用 DB だけ。別の DB を指しているときは何もせず止める
  if (url !== TEST_DATABASE_URL) {
    throw new Error(`DATABASE_URL が ${TEST_DATABASE_URL} ではないため中止します（現在: ${url}）`);
  }
  rmSync(TEST_DB_PATH, { force: true });
  execSync(`npx prisma db push --url ${url}`, { stdio: "inherit" });
}
