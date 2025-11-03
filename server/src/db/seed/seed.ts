// CLI runner for database seed scripts.
// Usage (via deno task): deno task db:seed -- 001-default
// Usage (direct): deno run --allow-read --allow-net --allow-env --allow-sys --env-file=.env server/src/db/seed/seed.ts 001-default

// Deno task forwards an extra `--` separator when you run `deno task db:seed -- 001-default`.
// Strip a single leading "--" if present so the seed name is the first arg.
const rawArgs = [...Deno.args];
if (rawArgs[0] === "--") rawArgs.shift();
const args = rawArgs;
const seedDir = new URL(".", import.meta.url).pathname; // path to this file's dir

function listSeeds() {
  const dir = Deno.readDirSync(seedDir);
  const seeds: string[] = [];
  for (const entry of dir) {
    if (!entry.isFile) continue;
    if (entry.name === "seed.ts") continue;
    if (!entry.name.endsWith(".ts")) continue;
    seeds.push(entry.name.replace(/\.ts$/, ""));
  }
  return seeds.sort();
}

if (args.includes("--list") || args.includes("-l")) {
  const seeds = listSeeds();
  console.log("Available seeds:");
  for (const s of seeds) console.log(`  - ${s}`);
  Deno.exit(0);
}

const seedName = args[0];
if (!seedName) {
  console.error("No seed specified. Use --list to see available seeds.");
  Deno.exit(1);
}

const seedPath = `${seedDir}${seedName}.ts`;

try {
  // Dynamic import of the seed module; module should export `run(): Promise<void>`
  const mod = await import(seedPath);
  if (typeof mod.run !== "function") {
    console.error(`Seed module ${seedName} does not export a 'run' function.`);
    Deno.exit(1);
  }

  await mod.run();
  Deno.exit(0);
} catch (err) {
  console.error(`Failed to run seed ${seedName}:`, err);
  Deno.exit(1);
}
