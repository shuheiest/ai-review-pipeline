import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type Task as TaskRow } from "@/generated/prisma/client";
import type { Priority, Status, Task } from "@/server/domain/task/task";

// DB の場所。テストでは DATABASE_URL でテスト用の SQLite に差し替える（vitest.config.mts）
const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

// next dev のホットリロードで PrismaClient が増えないよう globalThis に 1 つだけ持つ
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
g.prisma = prisma;

function toTask(row: TaskRow): Task {
  return {
    ...row,
    status: row.status as Status,
    priority: row.priority as Priority,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

type Filter = { status?: Status; priority?: Priority };
type CreateData = { title: string; dueDate?: string; priority: Priority };
type UpdateData = {
  title?: string;
  dueDate?: string | null;
  priority?: Priority;
  status?: Status;
  completedAt?: Date | null;
};

export const taskRepository = {
  async findMany(where: Filter): Promise<Task[]> {
    const rows = await prisma.task.findMany({ where, orderBy: { createdAt: "desc" } });
    return rows.map(toTask);
  },
  async findById(id: string): Promise<Task | null> {
    const row = await prisma.task.findUnique({ where: { id } });
    return row ? toTask(row) : null;
  },
  async create(data: CreateData): Promise<Task> {
    return toTask(await prisma.task.create({ data }));
  },
  async update(id: string, data: UpdateData): Promise<Task> {
    return toTask(await prisma.task.update({ where: { id }, data }));
  },
  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  },
};
