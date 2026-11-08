// シナリオテスト用の SQLite。globalSetup で毎回作り直し、各テストの前に空にする（tests/scenarios/db.ts）
export const TEST_DB_PATH = "prisma/test.db";
export const TEST_DATABASE_URL = `file:./${TEST_DB_PATH}`;
