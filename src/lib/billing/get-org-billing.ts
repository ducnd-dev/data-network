import { createAdminClient } from "@/lib/supabase/admin";

export type OrgBillingState = {
  plan: string;
  polar_subscription_id: string | null;
  polar_subscription_status: string | null;
  billing_email: string | null;
};

export async function getOrgBilling(
  organizationId: string
): Promise<OrgBillingState | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("organizations")
    .select("plan, polar_subscription_id, polar_subscription_status, billing_email")
    .eq("id", organizationId)
    .single();
  return data;
}
