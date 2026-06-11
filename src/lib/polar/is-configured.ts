import { getPolar } from "@/lib/polar/client";

export function isPolarConfigured(): boolean {
  const client = getPolar();
  const proProduct = process.env.POLAR_PRODUCT_ID_PRO_MONTHLY?.trim();
  const businessProduct = process.env.POLAR_PRODUCT_ID_BUSINESS_MONTHLY?.trim();
  return Boolean(client && proProduct && businessProduct);
}
