/**
 * Brand voice (marketing copy):
 * - Confident, plain English, outcome-first
 * - AU spelling: organisation, digitise, analyse
 * - Avoid vendor jargon on homepage (Azure, RLS, Polar)
 * - Technical detail belongs on /about ("Built in the open")
 */

export const BRAND_NAME = "Data Network";
export const BRAND_TAGLINE = "Invoice OCR for Australian bookkeepers and SMEs";

export const BRAND_POSITIONING =
  "The fastest way for Australian bookkeepers to turn paper invoices into clean, structured data.";

export const BRAND_STORY_SHORT =
  "Data Network helps bookkeepers and SMEs digitise invoices without re-keying every line. Upload a PDF, review extracted fields with confidence scores, and download JSON or CSV for your workflow.";

export const FREE_MONTHLY_CREDITS = 20;

export const FREE_CREDITS_LABEL = `${FREE_MONTHLY_CREDITS} page credits per month`;

export const CREDITS_EXPLAINER =
  "1 page credit = 1 page in your PDF. Complex document types use 2× credits.";

export const CREDITS_RESET_HINT = "Page credits reset on the 1st of each month.";

export const PRICING_NOTE = "Prices in USD. Taxes are handled at checkout.";
export const PRICING_GST_NOTE = PRICING_NOTE;

export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() || "support@data-network.app";

export const META_DESCRIPTION =
  "Upload invoices and receipts, get structured data with confidence scores. Built for Australian bookkeepers and SMEs.";

export const META_KEYWORDS = [
  "invoice OCR",
  "receipt OCR Australia",
  "bookkeeping automation",
  "invoice data extraction",
  "Australian SME",
  "structured invoice data",
];

export const BRAND_ROADMAP = [
  "Phase 1 — OCR SaaS",
  "Phase 2 — AI OCR + Export",
  "Phase 3 — Human Verify",
  "Phase 4 — Data Network",
  "Phase 5 — Marketplace",
  "Phase 6 — AI To Earn",
] as const;

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}
