import { createAdminClient } from "@/lib/supabase/admin";
import { planFromProductId } from "@/lib/polar/plans";

export type PolarSubscription = {
  id: string;
  customerId: string;
  productId: string;
  status: string;
  customer?: {
    externalId?: string | null;
    email?: string | null;
  } | null;
};

function normalizedStatus(status: string | undefined): string {
  if (!status) return "unknown";
  return status.toLowerCase();
}

function isEntitledStatus(status: string | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function organizationIdFromSubscription(
  subscription: PolarSubscription
): string | null {
  return subscription.customer?.externalId ?? null;
}

export async function updateOrgFromSubscription(
  organizationId: string,
  subscription: PolarSubscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const status = subscription.status;
  const entitled = isEntitledStatus(status);
  const plan = entitled ? planFromProductId(subscription.productId) : "free";

  await admin
    .from("organizations")
    .update({
      polar_customer_id: subscription.customerId,
      polar_subscription_id: subscription.id,
      polar_subscription_status: normalizedStatus(status),
      plan: entitled ? plan : "free",
      ...(subscription.customer?.email
        ? { billing_email: subscription.customer.email }
        : {}),
    })
    .eq("id", organizationId);
}

export async function syncOrgSubscriptionStatus(
  organizationId: string,
  subscription: PolarSubscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const status = subscription.status;
  const entitled = isEntitledStatus(status);
  const plan = entitled ? planFromProductId(subscription.productId) : undefined;

  await admin
    .from("organizations")
    .update({
      polar_customer_id: subscription.customerId,
      polar_subscription_id: subscription.id,
      polar_subscription_status: normalizedStatus(status),
      ...(plan ? { plan } : {}),
      ...(subscription.customer?.email
        ? { billing_email: subscription.customer.email }
        : {}),
    })
    .eq("id", organizationId);
}

export async function setOrgCanceled(
  organizationId: string,
  subscription: PolarSubscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      polar_customer_id: subscription.customerId,
      polar_subscription_id: subscription.id,
      polar_subscription_status: "canceled",
    })
    .eq("id", organizationId);
}

export async function downgradeOrg(organizationId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      polar_subscription_id: null,
      polar_subscription_status: "canceled",
      plan: "free",
    })
    .eq("id", organizationId);
}

export async function setOrgPastDue(
  organizationId: string,
  subscription: PolarSubscription
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("organizations")
    .update({
      polar_customer_id: subscription.customerId,
      polar_subscription_id: subscription.id,
      polar_subscription_status: "past_due",
    })
    .eq("id", organizationId);
}
