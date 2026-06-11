#!/usr/bin/env node
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const REQUIRED = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
];

const RECOMMENDED = [
  "NEXT_PUBLIC_R2_PUBLIC_URL",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_PRO_MONTHLY",
  "STRIPE_PRICE_ID_BUSINESS_MONTHLY",
  "CRON_SECRET",
];

function status(key) {
  const val = process.env[key]?.trim();
  if (!val) return "MISSING";
  if (
    (key === "NEXT_PUBLIC_SITE_URL" || key === "NEXT_PUBLIC_SUPABASE_URL") &&
    (val.includes("localhost") || val.includes("127.0.0.1"))
  ) {
    return "LOCAL — use cloud URL for Vercel";
  }
  return "ready";
}

console.log("=== Vercel Production env checklist ===\n");
console.log("Required:");
for (const k of REQUIRED) console.log(`  [${status(k)}] ${k}`);
console.log("\nRecommended:");
for (const k of RECOMMENDED) console.log(`  [${status(k)}] ${k}`);
console.log("\nThen: npx vercel login && npm run deploy");
