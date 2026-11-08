import { handle } from "@hono/vercel";
import app from "@/server/routes/tasks";

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
