#!/usr/bin/env node
/**
 * Create Polar subscription products for Pro and Business monthly plans.
 * Prints env vars to add to .env.local.
 *
 *   POLAR_ACCESS_TOKEN=... node scripts/setup-polar-products.mjs
 */
import { Polar } from "@polar-sh/sdk";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
if (!accessToken) {
  console.error("Missing POLAR_ACCESS_TOKEN");
  process.exit(1);
}

const polar = new Polar({
  accessToken,
  server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
});

async function createMonthlyProduct(name, description, amountCents) {
  return polar.products.create({
    name,
    description,
    recurringInterval: "month",
    recurringIntervalCount: 1,
    prices: [
      {
        amountType: "fixed",
        priceCurrency: "usd",
        priceAmount: amountCents,
      },
    ],
  });
}

const pro = await createMonthlyProduct(
  "Data Network Pro",
  "500 page credits per month. All document types.",
  2900
);

const business = await createMonthlyProduct(
  "Data Network Business",
  "3000 page credits per month. High-volume OCR.",
  9900
);

console.log("\n=== Polar products created ===\n");
console.log(`Pro product ID: ${pro.id}`);
console.log(`Business product ID: ${business.id}`);
console.log("\nAdd to .env.local:\n");
console.log(`POLAR_PRODUCT_ID_PRO_MONTHLY=${pro.id}`);
console.log(`POLAR_PRODUCT_ID_BUSINESS_MONTHLY=${business.id}`);
console.log("\nWebhook URL for Polar dashboard:");
console.log(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/polar/webhook`);
console.log(
  "\nSubscribe to events: subscription.active, subscription.updated, subscription.canceled, subscription.past_due, subscription.revoked"
);
