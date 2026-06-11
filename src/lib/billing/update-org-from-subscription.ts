import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function planFromPriceId(priceId: string | undefined): "pro" | "business" | "free" {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY) return "business";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO_MONTHLY) return "pro";
  return "pro";
}

export async function updateOrgFromSubscription(
  organizationId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const status = subscription.status;
  const active = status === "active" || status === "trialing";
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = active ? planFromPriceId(priceId) : "free";

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: subscription.id,
      stripe_subscription_status: status,
      plan,
    })
    .eq("id", organizationId);
}

export async function downgradeOrg(organizationId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: null,
      stripe_subscription_status: "canceled",
      plan: "free",
    })
    .eq("id", organizationId);
}

export async function setOrgPastDue(
  organizationId: string,
  subscriptionId: string
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_subscription_status: "past_due",
    })
    .eq("id", organizationId);
}
