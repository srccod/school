import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./server/src/db/migrations",
  schema: "./server/src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL")!,
  },
});
