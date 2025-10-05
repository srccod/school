import {
  pgSchema,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.ts";

export const modulesSchema = pgSchema("modules");

export const modules = modulesSchema.table("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  instructions: jsonb("instructions").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = modulesSchema.table("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moduleToFile = modulesSchema.table(
  "module_to_file",
  {
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isEntryPoint: boolean("is_entry_point").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false),
  },
  (table) => [primaryKey({ columns: [table.moduleId, table.fileId] })]
);

export const userModules = modulesSchema.table("user_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  files: jsonb("files").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
