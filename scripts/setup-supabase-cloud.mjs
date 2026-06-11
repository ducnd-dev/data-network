#!/usr/bin/env node
/**
 * Create a Supabase cloud project via Management API and apply migrations.
 *
 * Prerequisites:
 *   1. Personal access token: https://supabase.com/dashboard/account/tokens
 *   2. export SUPABASE_ACCESS_TOKEN=sbp_...
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx npm run db:setup:cloud
 */
import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { readFileSync as readSql, readdirSync } from "fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const migrationsDir = join(root, "supabase", "migrations");

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  console.error("Set SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const projectName = process.env.SUPABASE_PROJECT_NAME ?? "data-network";
const region = process.env.SUPABASE_REGION ?? "ap-southeast-2";
const dbPass = process.env.SUPABASE_DB_PASSWORD ?? randomBytes(16).toString("base64url");

async function api(path, options = {}) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
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

async function waitForHealthy(ref, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const health = await api(`/projects/${ref}/health`);
      const db = Array.isArray(health)
        ? health.find((h) => h.name === "db")
        : null;
      if (!db || db.status === "ACTIVE_HEALTHY") return;
    } catch {
      /* project still provisioning */
    }
    console.log(`  waiting for project... (${i + 1}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error("Project did not become healthy in time");
}

async function applyMigrations(databaseUrl) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query(`
    create table if not exists public.schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    const { rows } = await client.query(
      "select 1 from public.schema_migrations where id = $1",
      [file]
    );
    if (rows.length > 0) {
      console.log(`  skip ${file}`);
      continue;
    }
    console.log(`  apply ${file}`);
    const sql = readSql(join(migrationsDir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (id) values ($1)", [file]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
  await client.end();
}

console.log("=== Supabase Cloud setup ===\n");

const orgs = await api("/organizations");
if (!orgs?.length) {
  console.error("No organizations found on this Supabase account.");
  process.exit(1);
}

const orgId = process.env.SUPABASE_ORG_ID ?? orgs[0].id;
console.log(`Using organization: ${orgs.find((o) => o.id === orgId)?.name ?? orgId}`);

console.log(`Creating project "${projectName}" in ${region}...`);
const project = await api("/projects", {
  method: "POST",
  body: JSON.stringify({
    organization_id: orgId,
    name: projectName,
    region,
    db_pass: dbPass,
  }),
});

const ref = project.id ?? project.ref;
console.log(`Project ref: ${ref}`);
console.log("Waiting for database to be ready...");
await waitForHealthy(ref);

console.log("Fetching API keys...");
const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
const anon = keys.find((k) => k.name === "anon" || k.type === "legacy" && k.prefix === "anon")?.api_key
  ?? keys.find((k) => k.type === "publishable")?.api_key;
const service = keys.find((k) => k.name === "service_role" || k.type === "legacy" && k.prefix === "service_role")?.api_key
  ?? keys.find((k) => k.type === "secret")?.api_key;

const apiUrl = `https://${ref}.supabase.co`;
const databaseUrl = `postgresql://postgres.${ref}:${encodeURIComponent(dbPass)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

console.log("Applying migrations...");
await applyMigrations(
  process.env.DATABASE_URL ??
    `postgresql://postgres:${encodeURIComponent(dbPass)}@db.${ref}.supabase.co:5432/postgres`
);

upsertEnv({
  NEXT_PUBLIC_SUPABASE_URL: apiUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ?? "",
  SUPABASE_SERVICE_ROLE_KEY: service ?? "",
  DATABASE_URL: databaseUrl,
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
});

console.log("\n=== Done ===");
console.log(`  Dashboard: https://supabase.com/dashboard/project/${ref}`);
console.log(`  API URL:   ${apiUrl}`);
console.log(`  DB pass:   ${dbPass}  (save this — shown once)`);
console.log(`  .env.local updated`);
console.log("\nRun: npm run dev");
