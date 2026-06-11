#!/usr/bin/env node
/**
 * Push .env.local vars to Vercel Production.
 * Requires: npx vercel login && npx vercel link
 *
 *   npm run push:vercel-env
 *   npm run push:vercel-env -- --dry-run
 */
import { spawnSync } from "child_process";
import { loadEnvLocal, projectRoot } from "./load-env-local.mjs";

const dryRun = process.argv.includes("--dry-run");
const PROD_URL = "https://data-network.vercel.app";

loadEnvLocal();

const LOCAL_ONLY = new Set([
  "DATABASE_URL",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_NAME",
  "SUPABASE_REGION",
  "SUPABASE_ORG_ID",
]);

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_KEY_PREFIX",
  "NEXT_PUBLIC_R2_PUBLIC_URL",
  "OPENAI_API_KEY",
  "OCR_CLASSIFY_MODEL",
  "OCR_EXTRACT_MODEL",
  "OCR_AZURE_PAGE_COST_AUD",
  "OCR_LLM_CLASSIFY_COST_AUD",
  "OCR_LLM_EXTRACT_COST_AUD",
  "OCR_COST_SAFETY_FACTOR",
  "POLAR_ACCESS_TOKEN",
  "POLAR_SERVER",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_PRODUCT_ID_PRO_MONTHLY",
  "POLAR_PRODUCT_ID_BUSINESS_MONTHLY",
  "CRON_SECRET",
];

function getVal(key) {
  if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    );
  }
  if (key === "NEXT_PUBLIC_SITE_URL") return PROD_URL;
  return process.env[key]?.trim();
}

console.log("=== Push env → Vercel Production ===\n");
if (dryRun) console.log("(dry-run)\n");

let pushed = 0;
let failed = 0;
const missing = [];

for (const key of KEYS) {
  if (LOCAL_ONLY.has(key)) continue;
  const val = getVal(key);
  if (!val) {
    missing.push(key);
    continue;
  }
  if (val.includes("127.0.0.1") || val.includes("localhost")) {
    console.log(`  skip ${key} (local URL)`);
    continue;
  }

  if (dryRun) {
    console.log(`  would push ${key}`);
    pushed++;
    continue;
  }

  const r = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "production", "--force", "--yes", "--value", val],
    { cwd: projectRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );

  if (r.status === 0) {
    console.log(`  ✓ ${key}`);
    pushed++;
  } else {
    console.error(`  ✗ ${key}: ${(r.stderr || r.stdout || "").trim().slice(0, 120)}`);
    failed++;
  }
}

console.log(`\nPushed: ${pushed}, failed: ${failed}`);
if (missing.length) {
  console.log("\nMissing locally:");
  for (const k of missing) console.log(`  ○ ${k}`);
}
if (!dryRun && pushed > 0) console.log("\nNext: npm run deploy");

process.exit(failed > 0 ? 1 : 0);
