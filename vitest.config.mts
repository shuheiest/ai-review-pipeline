import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./tests/test-db";

// 外から DATABASE_URL が渡されていなければテスト用 DB を使う。渡されていれば tests/global-setup.ts のガードが検査する
process.env.DATABASE_URL ??= TEST_DATABASE_URL;

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    env: { DATABASE_URL: process.env.DATABASE_URL },
    globalSetup: ["tests/global-setup.ts"],
    // SQLite ファイルを複数プロセスから同時に触らないよう、テストファイルは直列に走らせる
    fileParallelism: false,
    passWithNoTests: true,
  },
});
