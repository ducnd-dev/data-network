import { Webhooks } from "@polar-sh/nextjs";
import {
  downgradeOrg,
  organizationIdFromSubscription,
  setOrgCanceled,
  setOrgPastDue,
  syncOrgSubscriptionStatus,
  updateOrgFromSubscription,
  type PolarSubscription,
} from "@/lib/billing/update-org-from-subscription";

export const runtime = "nodejs";

async function handleSubscription(
  subscription: PolarSubscription,
  mode: "active" | "sync" | "canceled" | "past_due" | "revoked"
): Promise<void> {
  const organizationId = organizationIdFromSubscription(subscription);
  if (!organizationId) return;

  switch (mode) {
    case "active":
      await updateOrgFromSubscription(organizationId, subscription);
      break;
    case "sync":
      await syncOrgSubscriptionStatus(organizationId, subscription);
      break;
    case "canceled":
      await setOrgCanceled(organizationId, subscription);
      break;
    case "past_due":
      await setOrgPastDue(organizationId, subscription);
      break;
    case "revoked":
      await downgradeOrg(organizationId);
      break;
  }
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionActive: async ({ data: subscription }) => {
    await handleSubscription(subscription as PolarSubscription, "active");
  },
  onSubscriptionUpdated: async ({ data: subscription }) => {
    const sub = subscription as PolarSubscription;
    const status = sub.status;
    if (status === "past_due" || status === "unpaid") {
      await handleSubscription(sub, "past_due");
      return;
    }
    if (status === "canceled") {
      await handleSubscription(sub, "canceled");
      return;
    }
    if (status === "active" || status === "trialing") {
      await handleSubscription(sub, "sync");
    }
  },
  onSubscriptionCanceled: async ({ data: subscription }) => {
    await handleSubscription(subscription as PolarSubscription, "canceled");
  },
  onSubscriptionRevoked: async ({ data: subscription }) => {
    await handleSubscription(subscription as PolarSubscription, "revoked");
  },
});
