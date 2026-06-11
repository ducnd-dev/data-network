import { planQuota as economicsQuota } from "@/lib/billing/unit-economics";

export type OrgPlan = "free" | "pro" | "business";

export function monthlyPageLimit(plan: string | null | undefined): number {
  return economicsQuota(plan);
}

export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "pro" || plan === "business";
}

export function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "business":
      return "Business";
    case "pro":
      return "Pro";
    default:
      return "Free";
  }
}

export function planPriceAud(plan: OrgPlan): string {
  switch (plan) {
    case "business":
      return "$99";
    case "pro":
      return "$29";
    default:
      return "$0";
  }
}

export const PLAN_FEATURES: Record<
  OrgPlan,
  { pages: number; price: string; description: string }
> = {
  free: {
    pages: 20,
    price: "$0",
    description: "Invoice & receipt OCR only. 20 page credits per month.",
  },
  pro: {
    pages: 500,
    price: "$29",
    description: "All document types. General documents use 2× page credits.",
  },
  business: {
    pages: 3000,
    price: "$99",
    description: "High-volume OCR with all document types and smart field extraction.",
  },
};
