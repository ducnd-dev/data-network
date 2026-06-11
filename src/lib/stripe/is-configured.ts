import { getStripe } from "@/lib/stripe/client";

export function isStripeConfigured(): boolean {
  const stripe = getStripe();
  const proPrice = process.env.STRIPE_PRICE_ID_PRO_MONTHLY?.trim();
  const businessPrice = process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY?.trim();
  return Boolean(stripe && proPrice && businessPrice);
}
