import { db } from "../connection.ts";
import {
  modules,
  moduleToFile,
  starterFiles,
} from "../schema/module-schema.ts";

const factorFinderText = `- A number's factors are all the (positive whole) numbers that divide it evenly. For example, 2 x 13 = 26, so 2 and 13 are factors of 26. Also, 1 x 26 = 26, so 1 and 26 are also factors of 26. No other positive whole numbers divide 26 evenly, so 1, 2, 13, and 26 are the only factors of 26.
- Write a function that takes one parameter (a positive whole number) and returns a list of all its factors.
- Can you find a number with more than 10 factors? 20?? 30?!`;

console.log("Seeding database...");
const modulesInsert = await db
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
  .returning();

const moduleToFileInserts = await Promise.all(
  modulesInsert.map(async (mod) => {
    if (mod.slug === "default") {
      const file1 = await db
        .insert(starterFiles)
        .values({
          name: "main.py",
          content: "",
        })
        .returning()
        .then((r) => r[0]);
      await db.insert(moduleToFile).values([
        {
          moduleId: mod.id,
          fileId: file1.id,
          sortOrder: 0,
          isEntryPoint: true,
          isActive: true,
        },
      ]);
    } else if (mod.slug === "factor-finder") {
      const file = await db
        .insert(starterFiles)
        .values({
          name: "factor-finder.py",
          content: "",
        })
        .returning()
        .then((r) => r[0]);
      await db.insert(moduleToFile).values({
        moduleId: mod.id,
        fileId: file.id,
        sortOrder: 0,
        isEntryPoint: true,
        isActive: true,
      });
    }
  })
);

console.log("Seeding completed.");
Deno.exit();
