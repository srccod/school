import { db } from "../connection.ts";
import { eq } from "drizzle-orm";
import {
  modules,
  moduleToFile,
  starterFiles,
} from "../schema/module-schema.ts";

const factorFinderText = `- A number's factors are all the (positive whole) numbers that divide it evenly. For example, 2 x 13 = 26, so 2 and 13 are factors of 26. Also, 1 x 26 = 26, so 1 and 26 are also factors of 26. No other positive whole numbers divide 26 evenly, so 1, 2, 13, and 26 are the only factors of 26.
- Write a function that takes one parameter (a positive whole number) and returns a list of all its factors.
- Can you find a number with more than 10 factors? 20?? 30?!`;

export async function run() {
  console.log("Seeding database...");

  // Insert modules but ignore if the slug already exists.
  await db
    .insert(modules)
    .values([
      {
        slug: "default",
        name: "Default",
        instructions: [
          {
            text: "",
          },
        ],
      },
      {
        slug: "factor-finder",
        name: "Factor Finder",
        instructions: [{ text: factorFinderText }],
      },
    ])
    .onConflictDoNothing();

  // Now fetch the modules (whether newly created or pre-existing).
  const modulesInsert = [
    (
      await db
        .select()
        .from(modules)
        .where(eq(modules.slug, "default"))
        .limit(1)
    )[0],
    (
      await db
        .select()
        .from(modules)
        .where(eq(modules.slug, "factor-finder"))
        .limit(1)
    )[0],
  ];

  await Promise.all(
    modulesInsert.map(async (mod) => {
      if (!mod) return;

      if (mod.slug === "default") {
        // Ensure a starter file exists with this name. Try to find first to avoid duplicates.
        let file1 = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "main.py"))
            .limit(1)
        )[0];
        if (!file1) {
          file1 = await db
            .insert(starterFiles)
            .values({
              name: "main.py",
              content: "",
            })
            .returning()
            .then((r) => r[0]);
        }

        // Link module to file, but ignore if the (moduleId,fileId) PK already exists.
        await db
          .insert(moduleToFile)
          .values([
            {
              moduleId: mod.id,
              fileId: file1.id,
              sortOrder: 0,
              isEntryPoint: true,
              isActive: true,
            },
          ])
          .onConflictDoNothing();
      } else if (mod.slug === "factor-finder") {
        let file = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "factor-finder.py"))
            .limit(1)
        )[0];
        if (!file) {
          file = await db
            .insert(starterFiles)
            .values({
              name: "factor-finder.py",
              content: "",
            })
            .returning()
            .then((r) => r[0]);
        }

        await db
          .insert(moduleToFile)
          .values({
            moduleId: mod.id,
            fileId: file.id,
            sortOrder: 0,
            isEntryPoint: true,
            isActive: true,
          })
          .onConflictDoNothing();
      }
    })
  );

  console.log("Seeding completed.");
}
