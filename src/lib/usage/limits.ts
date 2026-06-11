import { createAdminClient } from "@/lib/supabase/admin";
import { monthlyPageLimit } from "@/lib/billing/plans";

export type UsageRecordMetadata = {
  document_id: string;
  document_type?: string;
  pipeline_id?: string;
  credit_multiplier?: number;
  pages_count?: number;
  credits_charged?: number;
};

export async function getOrgUsage(organizationId: string): Promise<{
  used: number;
  limit: number;
  plan: string;
  remaining: number;
}> {
  const admin = createAdminClient();
  if (!admin) return { used: 0, limit: 20, plan: "free", remaining: 20 };

  const { data: org } = await admin
    .from("organizations")
    .select("plan, pages_used_this_period")
    .eq("id", organizationId)
    .single();

  const plan = org?.plan ?? "free";
  const used = org?.pages_used_this_period ?? 0;
  const limit = monthlyPageLimit(plan);
  return { used, limit, plan, remaining: Math.max(0, limit - used) };
}

export async function canProcessOcr(
  organizationId: string,
  creditsNeeded = 1
): Promise<{
  allowed: boolean;
  reason?: string;
  used: number;
  limit: number;
  remaining: number;
}> {
  const { used, limit, plan, remaining } = await getOrgUsage(organizationId);

  if (used + creditsNeeded > limit) {
    return {
      allowed: false,
      reason:
        plan === "free"
          ? `Free plan limit reached (${limit} credits/month). Upgrade to Pro for more.`
          : `Need ${creditsNeeded} credit${creditsNeeded === 1 ? "" : "s"}, but only ${remaining} remaining this month.`,
      used,
      limit,
      remaining,
    };
  }

  return { allowed: true, used, limit, remaining };
}

export async function recordOcrUsage(
  organizationId: string,
  metadata: UsageRecordMetadata,
  creditsCharged: number
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin.from("usage_events").insert({
    organization_id: organizationId,
    event_type: "ocr_page",
    pages_count: metadata.pages_count ?? creditsCharged,
    metadata: {
      ...metadata,
      credits_charged: creditsCharged,
    },
  });

  const { data: org } = await admin
    .from("organizations")
    .select("pages_used_this_period")
    .eq("id", organizationId)
    .single();

  await admin
    .from("organizations")
    .update({
      pages_used_this_period: (org?.pages_used_this_period ?? 0) + creditsCharged,
    })
    .eq("id", organizationId);
}
