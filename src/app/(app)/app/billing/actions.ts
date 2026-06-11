"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { USER_ERRORS } from "@/lib/errors/user-messages";
import { getPolar, getSiteUrl } from "@/lib/polar/client";
import { isPolarConfigured } from "@/lib/polar/is-configured";
import { productId } from "@/lib/polar/plans";
import type { OrgPlan } from "@/lib/billing/plans";

async function getOrgBillingFields(organizationId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("organizations")
    .select("id, name, plan, polar_customer_id, polar_subscription_id, polar_subscription_status")
    .eq("id", organizationId)
    .single();
  return data;
}

function billingErrorRedirect(message: string): never {
  redirect(`/app/billing?error=${encodeURIComponent(message)}`);
}

function requirePolarReady(): void {
  if (!isPolarConfigured()) {
    billingErrorRedirect(USER_ERRORS.POLAR_NOT_CONFIGURED);
  }
}

export async function startProCheckout(): Promise<void> {
  return startCheckout("pro");
}

export async function startBusinessCheckout(): Promise<void> {
  return startCheckout("business");
}

async function startCheckout(plan: Exclude<OrgPlan, "free">): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    billingErrorRedirect(USER_ERRORS.BILLING_ADMIN_ONLY);
  }

  requirePolarReady();

  const polar = getPolar();
  const polarProductId = productId(plan);

  if (!polar || !polarProductId) {
    billingErrorRedirect(USER_ERRORS.POLAR_NOT_CONFIGURED);
  }

  const supabase = await createClient();
  if (!supabase) billingErrorRedirect(USER_ERRORS.DATABASE_NOT_CONFIGURED);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) billingErrorRedirect("Signed-in user email required");

  const siteUrl = getSiteUrl();
  const checkout = await polar.checkouts.create({
    products: [polarProductId],
    externalCustomerId: profile.organization_id,
    customerEmail: user.email,
    successUrl: `${siteUrl}/app/billing?subscribed=1`,
    metadata: { plan },
  });

  if (!checkout.url) billingErrorRedirect(USER_ERRORS.CHECKOUT_FAILED);
  redirect(checkout.url);
}

export async function openCustomerPortal(): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    billingErrorRedirect(USER_ERRORS.BILLING_ADMIN_ONLY);
  }

  requirePolarReady();

  const polar = getPolar();
  const org = await getOrgBillingFields(profile.organization_id);
  if (!polar || !org?.polar_subscription_id) {
    billingErrorRedirect(USER_ERRORS.NO_BILLING_ACCOUNT);
  }

  const session = await polar.customerSessions.create({
    externalCustomerId: profile.organization_id,
    returnUrl: `${getSiteUrl()}/app/billing`,
  });

  if (!session.customerPortalUrl) {
    billingErrorRedirect("Could not open billing portal. Please try again.");
  }

  redirect(session.customerPortalUrl);
}
