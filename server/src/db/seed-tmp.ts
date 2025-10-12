import { db } from "./connection.ts";
import { modules, moduleToFile, starterFiles } from "./schema/module-schema.ts";

console.log("Seeding database...");
const modulesInsert = await db
  .insert(modules)
  .values([
    {
      slug: "hello-world",
      name: "Hello World",
      instructions: [
        { text: "Step 1 - make hello world" },
        { text: "Step 2 - add more instructions" },
      ],
    },
    {
      slug: "calculator",
      name: "Calculator",
      instructions: [
        { text: "This module provides basic arithmetic functions." },
      ],
    },
    {
      slug: "getting-started",
      name: "Getting Started",
      instructions: [
        {
          text: "This is a simple Python coding environment. You can write and execute Python code here. Try modifying the existing code or adding new code to get started!",
        },
      ],
    },
    {
      slug: "interactive-input",
      name: "Interactive Input",
      instructions: [
        {
          text: "This program prompts the user for their name and then greets them.",
        },
        { text: "Here's a second panel" },
      ],
    },
  ])
  .returning();

const moduleToFileInserts = await Promise.all(
  modulesInsert.map(async (mod) => {
    if (mod.slug === "hello-world") {
      const file1 = await db
        .insert(starterFiles)
        .values({
          name: "main.py",
          content: `from utils import say_hello\n\nsay_hello("World")`,
        })
        .returning()
        .then((r) => r[0]);
      const file2 = await db
        .insert(starterFiles)
        .values({
          name: "utils.py",
          content: `def say_hello(name):\n\tprint(f"Hello, {name}!")`,
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
        {
          moduleId: mod.id,
          fileId: file2.id,
          sortOrder: 1,
          isEntryPoint: false,
          isActive: true,
        },
      ]);
    } else if (mod.slug === "calculator") {
      const file = await db
        .insert(starterFiles)
        .values({
          name: "calculator.py",
          content: `def add(a, b):
  return a + b

def subtract(a, b):
  return a - b

def multiply(a, b):
  return a * b

def divide(a, b):
  return a / b
`,
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
    } else if (mod.slug === "getting-started") {
      const file = await db
        .insert(starterFiles)
        .values({
          name: "main.py",
          content: `print("Welcome to the Python coding environment!")\n\n# Try modifying this print statement and run the code.`,
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
    } else if (mod.slug === "interactive-input") {
      const file = await db
        .insert(starterFiles)
        .values({
          name: "main.py",
          content: `name = input("Enter your name: ")\nprint(f"Hello, {name}!")`,
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
