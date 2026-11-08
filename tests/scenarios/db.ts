import { prisma } from "@/server/repository/task";

// 各テストの前に呼び、テストの間でデータを共有しないようにする（docs/test-strategy.md 3.）
export async function resetDb(): Promise<void> {
  await prisma.task.deleteMany();
}
