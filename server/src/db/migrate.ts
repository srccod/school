import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = Deno.env.get("DATABASE_URL")!;

console.log("DATABASE_URL:", connectionString);
console.log("Connecting to database...");

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

console.log("Running migrations...");

await migrate(db, { migrationsFolder: "server/src/db/migrations" });

console.log("Migrations completed.");

await sql.end();

console.log("Connection closed.");