import { db } from "../connection.ts";
import { eq } from "drizzle-orm";
import {
  modules,
  moduleToFile,
  starterFiles,
} from "../schema/module-schema.ts";

const additionQuizText = `# Addition Quiz

Quiz time! **Timed** quiz time. Let's build a game that:
  - runs for a fixed time (20 seconds, for example)
  - generates two random numbers
  - prompts the user to add them together
  - checks if the answer is correct
  - keeps track of the score
  - reports the total score and the number of attempts when the game ends

The starter code shows you how to use the \`time\` module to calculate the stop time. How can you use that end time to stop the game?
`;

const additionQuizCode = `import random
import time

# set game start and stop times
game_duration_seconds = 20
start_time = time.time()
stop_time = start_time + game_duration_seconds

`;

const mathQuizText = `# Math Quiz

Let's expand our Addition Quiz game. Instead of asking only addition problems, let's also randomly generate addition, subtraction, and multiplication problems.
`;

const mathQuizText2 = `# Create an Operations Library

Our game loop will stay mostly the same. But we need a way to pick and call a random math operation.

We could put all this code in the same file as the game loop, but that would get messy fast. Instead, let's create a separate module (file) to hold our math operations.

In the \`operations.py\` file, create three functions:
  - \`plus\`: takes two numbers and returns their sum.
  - \`minus\`: takes two numbers and returns their difference.
  - \`times\`: takes two numbers and returns their product.

Once you have those, I'll show you how to import and use them in the main game file.
`;

export async function run() {
  console.log("Seeding database...");

  // Insert modules but ignore if the slug already exists.
  await db
    .insert(modules)
    .values([
      {
        slug: "addition-quiz",
        name: "Addition Quiz",
        instructions: [
          {
            text: additionQuizText,
          },
        ],
      },
      {
        slug: "math-quiz",
        name: "Math Quiz",
        instructions: [{ text: mathQuizText }, { text: mathQuizText2 }],
      },
    ])
    .onConflictDoNothing();

  // Now fetch the modules (whether newly created or pre-existing).
  const modulesInsert = [
    (
      await db
        .select()
        .from(modules)
        .where(eq(modules.slug, "addition-quiz"))
        .limit(1)
    )[0],
    (
      await db
        .select()
        .from(modules)
        .where(eq(modules.slug, "math-quiz"))
        .limit(1)
    )[0],
  ];

  await Promise.all(
    modulesInsert.map(async (mod) => {
      if (!mod) return;

      if (mod.slug === "addition-quiz") {
        // Ensure a starter file exists with this name. Try to find first to avoid duplicates.
        let file1 = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "addition_quiz.py"))
            .limit(1)
        )[0];
        if (!file1) {
          file1 = await db
            .insert(starterFiles)
            .values({
              name: "addition_quiz.py",
              content: additionQuizCode,
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
      } else if (mod.slug === "math-quiz") {
        let file1 = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "math-quiz.py"))
            .limit(1)
        )[0];
        let file2 = (
          await db
            .select()
            .from(starterFiles)
            .where(eq(starterFiles.name, "operations.py"))
            .limit(1)
        )[0];
        if (!file1) {
          file1 = await db
            .insert(starterFiles)
            .values({
              name: "math-quiz.py",
              content: additionQuizCode,
            })
            .returning()
            .then((r) => r[0]);
        }
        if (!file2) {
          file2 = await db
            .insert(starterFiles)
            .values({
              name: "operations.py",
              content: "",
            })
            .returning()
            .then((r) => r[0]);
        }

        await db
          .insert(moduleToFile)
          .values({
            moduleId: mod.id,
            fileId: file1.id,
            sortOrder: 0,
            isEntryPoint: true,
            isActive: true,
          })
          .onConflictDoNothing();
        await db
          .insert(moduleToFile)
          .values({
            moduleId: mod.id,
            fileId: file2.id,
            sortOrder: 1,
            isEntryPoint: false,
            isActive: false,
          })
          .onConflictDoNothing();
      }
    })
  );

  console.log("Seeding completed.");
}
