import { decideStatusChange } from "@/server/domain/task/status";
import type { Status, Task } from "@/server/domain/task/task";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "@/server/domain/task/validation";
import { taskRepository as repo } from "@/server/repository/task";

export class UsecaseError extends Error {
  constructor(
    public readonly status: 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

async function mustFind(id: string): Promise<Task> {
  const task = await repo.findById(id);
  if (!task) throw new UsecaseError(404, `タスク ${id} は見つかりません`);
  return task;
}

export const listTasks = (query: ListTasksQuery): Promise<Task[]> => repo.findMany(query);

export const getTask = mustFind;

export const createTask = (input: CreateTaskInput): Promise<Task> => repo.create(input);

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  await mustFind(id);
  return repo.update(id, input);
}

export async function deleteTask(id: string): Promise<void> {
  await mustFind(id);
  await repo.delete(id);
}

export async function changeStatus(id: string, to: Status): Promise<Task> {
  const task = await mustFind(id);
  const change = decideStatusChange(task.status, to);
  if (change === "unchanged") return task;
  if (change === "forbidden") {
    throw new UsecaseError(409, `${task.status} から ${to} への変更は許可されていません`);
  }
  const completedAt = to === "done" ? new Date() : null;
  return repo.setStatus(id, to, completedAt);
}
