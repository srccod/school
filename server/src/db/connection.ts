import { drizzle } from "drizzle-orm/postgres-js";

export const db = drizzle(Deno.env.get("DATABASE_URL")!);
