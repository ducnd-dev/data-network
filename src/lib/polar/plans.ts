import type { OrgPlan } from "@/lib/billing/plans";

export function productId(plan: Exclude<OrgPlan, "free">): string | undefined {
  return plan === "business"
    ? process.env.POLAR_PRODUCT_ID_BUSINESS_MONTHLY?.trim()
    : process.env.POLAR_PRODUCT_ID_PRO_MONTHLY?.trim();
}

export function planFromProductId(
  productId: string | null | undefined
): Exclude<OrgPlan, "free"> | "free" {
  if (!productId) return "free";
  if (productId === process.env.POLAR_PRODUCT_ID_BUSINESS_MONTHLY?.trim()) {
    return "business";
  }
  if (productId === process.env.POLAR_PRODUCT_ID_PRO_MONTHLY?.trim()) {
    return "pro";
  }
  return "pro";
}
