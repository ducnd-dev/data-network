import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import pg from "pg";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const migrationsDir = join(import.meta.dirname, "..", "supabase", "migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set DATABASE_URL to your Supabase Postgres connection string.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

await client.query(`
  create table if not exists public.schema_migrations (
    id text primary key,
    applied_at timestamptz not null default now()
  );
`);

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const { rows } = await client.query(
    "select 1 from public.schema_migrations where id = $1",
    [file]
  );
  if (rows.length > 0) {
    console.log(`skip ${file}`);
    continue;
  }

  const sql = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`apply ${file}`);
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
console.log("Migrations complete.");
