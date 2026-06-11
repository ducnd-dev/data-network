#!/usr/bin/env node
/**
 * Start local Supabase (Docker), apply migrations, write .env.local keys.
 * Requires Docker Desktop running.
 */
import { execSync, spawnSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

function parseSupabaseEnv(output) {
  const map = {};
  for (const line of output.split("\n")) {
    const match = line.match(/^([A-Z_]+)="(.*)"$/);
    if (match) map[match[1]] = match[2];
  }
  return map;
}

function upsertEnv(updates) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${value}`;
    content = re.test(content) ? content.replace(re, line) : `${content.trim()}\n${line}\n`;
  }
  writeFileSync(envPath, content, "utf8");
}

console.log("=== Local Supabase setup ===\n");

try {
  run("docker info", { stdio: "pipe" });
} catch {
  console.error("Docker is not running. Start Docker Desktop, then rerun: npm run db:setup");
  process.exit(1);
}

if (!existsSync(join(root, "supabase", "config.toml"))) {
  run("npx supabase init");
}

console.log("\nStarting Supabase (first run may download images — several minutes)...\n");
const start = spawnSync("npx", ["supabase", "start"], { cwd: root, stdio: "inherit" });
if (start.status !== 0) {
  console.error("\nFailed to start Supabase. Try: npx supabase start --debug");
  process.exit(1);
}

const status = execSync("npx supabase status -o env", { cwd: root, encoding: "utf8" });
const info = parseSupabaseEnv(status);

const apiUrl = info.API_URL;
const anonKey = info.ANON_KEY ?? info.PUBLISHABLE_KEY;
const serviceKey = info.SERVICE_ROLE_KEY ?? info.SECRET_KEY;
const dbUrl = info.DB_URL;

if (!apiUrl || !anonKey || !serviceKey) {
  console.error("Could not parse supabase status. Run: npx supabase status");
  console.error(status);
  process.exit(1);
}

console.log("\nMigrations applied during supabase start.\n");

upsertEnv({
  NEXT_PUBLIC_SUPABASE_URL: apiUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  DATABASE_URL: dbUrl ?? "",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
});

console.log("\n=== Done ===");
console.log(`  API URL:  ${apiUrl}`);
console.log(`  Studio:   http://localhost:54323`);
console.log(`  .env.local updated`);
console.log("\nRun: npm run dev");
