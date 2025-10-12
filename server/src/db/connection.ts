import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema/index.ts";

export const db = drizzle(Deno.env.get("DATABASE_URL")!, { schema });
