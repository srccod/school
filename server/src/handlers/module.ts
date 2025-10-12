import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/connection.ts";
import * as schema from "../db/schema/module-schema.ts";
import { auth } from "./auth.ts";
import { ModuleResponse } from "../shared-types.ts";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session | null;
  };
}>();

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session);
  return next();
});

app.get("/", async (c) => {
  const allModules = await db.select().from(schema.modules);
  const allFiles = await db.select().from(schema.starterFiles);
  return c.json({ allModules, allFiles });
});

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = c.get("user");

  console.log("requesting user:", user);

  const [module] = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.slug, slug))
    .limit(1);
  if (!module) return c.json({ error: "Module not found" }, 404);

  const files = await db
    .select({
      id: schema.starterFiles.id,
      name: sql<string>`COALESCE(${schema.userFiles.name}, ${schema.starterFiles.name})`,
      content: sql<string>`COALESCE(${schema.userFiles.content}, ${schema.starterFiles.content})`,
      isEntryPoint: schema.moduleToFile.isEntryPoint,
      sortOrder: schema.moduleToFile.sortOrder,
    })
    .from(schema.starterFiles)
    .innerJoin(
      schema.moduleToFile,
      eq(schema.starterFiles.id, schema.moduleToFile.fileId)
    )
    .leftJoin(
      schema.userFiles,
      and(
        eq(schema.starterFiles.id, schema.userFiles.fileId),
        eq(schema.userFiles.userId, user?.id || "")
      )
    )
    .where(eq(schema.moduleToFile.moduleId, module.id));

  const payload: ModuleResponse = { ...module, files };

  return c.json(payload);
});

export const moduleHandler = app;
