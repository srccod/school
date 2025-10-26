import { dirname, fromFileUrl, join } from "@std/path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = Deno.env.get("DATABASE_URL")!;

console.log("DATABASE_URL:", connectionString);
console.log("Connecting to database...");

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

const __dirname = dirname(fromFileUrl(import.meta.url));
const migrationsFolder = join(__dirname, "migrations");

console.log(`Running migrations in ${migrationsFolder}...`);
for await (const dirEntry of Deno.readDir(migrationsFolder)) {
  console.log(" -", dirEntry.name);
}

await migrate(db, { migrationsFolder });

console.log("Migrations completed.");

await sql.end();

console.log("Connection closed.");
