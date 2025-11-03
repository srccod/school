import { db } from "../connection.ts";
import { eq } from "drizzle-orm";
import {
  modules,
  moduleToFile,
  starterFiles,
} from "../schema/module-schema.ts";

const guessingGameText = `# Guessing Game

Code a game that allows a user to guess a randomly generated number.

- After each guess, report if the guess is too high, too low, or correct.
- Limit the number of guesses. For example, after 5 incorrect guesses, the game is over. The limit should be reasonable for the range of numbers.
- Optionally, allow the user to choose the range of numbers (e.g., 1-50, 1-100) at the start of the game.`;

const guessingGameCode = `import random

target = random.randint(1, 100)`;

export async function run() {
  console.log("Seeding database...");

  // Insert modules but ignore if the slug already exists.
  await db
    .insert(modules)
    .values([
      {
        slug: "guessing-game",
        name: "Guessing Game",
        instructions: [
          {
            text: guessingGameText,
          },
        ],
      },
    ])
    .onConflictDoNothing();

  // Now fetch the modules (whether newly created or pre-existing).
  const modulesInsert = [
    (
      await db
        .select()
        .from(modules)
        .where(eq(modules.slug, "guessing-game"))
        .limit(1)
    )[0],
  ];

  await Promise.all(
    modulesInsert.map(async (mod) => {
      if (!mod) return;

      if (mod.slug === "guessing-game") {
        let file = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "guessing-game.py"))
            .limit(1)
        )[0];
        if (!file) {
          file = await db
            .insert(starterFiles)
            .values({
              name: "guessing-game.py",
              content: guessingGameCode,
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
  Deno.exit();
}
