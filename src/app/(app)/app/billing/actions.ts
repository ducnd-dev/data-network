"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { USER_ERRORS } from "@/lib/errors/user-messages";
import { getStripe, getSiteUrl } from "@/lib/stripe/client";

async function getOrgBillingFields(organizationId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("organizations")
    .select("id, name, plan, stripe_customer_id, stripe_subscription_status")
    .eq("id", organizationId)
    .single();
  return data;
}

async function ensureStripeCustomer(
  organizationId: string,
  email: string,
  orgName: string
): Promise<string | null> {
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) return null;

  const org = await getOrgBillingFields(organizationId);
  if (org?.stripe_customer_id) return org.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { organization_id: organizationId },
  });

  await admin
    .from("organizations")
    .update({ stripe_customer_id: customer.id, billing_email: email })
    .eq("id", organizationId);

  return customer.id;
}

function billingErrorRedirect(message: string): never {
  redirect(`/app/billing?error=${encodeURIComponent(message)}`);
}

export async function startProCheckout(): Promise<void> {
  return startCheckout("pro");
}

export async function startBusinessCheckout(): Promise<void> {
  return startCheckout("business");
}

async function startCheckout(plan: "pro" | "business"): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    billingErrorRedirect(USER_ERRORS.BILLING_ADMIN_ONLY);
  }

  const stripe = getStripe();
  const priceId =
    plan === "business"
      ? process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY
      : process.env.STRIPE_PRICE_ID_PRO_MONTHLY;

  if (!stripe || !priceId) {
    billingErrorRedirect(USER_ERRORS.STRIPE_NOT_CONFIGURED);
  }

  const supabase = await createClient();
  if (!supabase) billingErrorRedirect(USER_ERRORS.DATABASE_NOT_CONFIGURED);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) billingErrorRedirect("Signed-in user email required");

  const orgName = profile.organizations?.name ?? "Workspace";
  const customerId = await ensureStripeCustomer(
    profile.organization_id,
    user.email,
    orgName
  );
  if (!customerId) billingErrorRedirect("Could not create Stripe customer");

  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { organization_id: profile.organization_id, plan },
    subscription_data: {
      metadata: { organization_id: profile.organization_id, plan },
    },
    success_url: `${siteUrl}/app/billing?subscribed=1`,
    cancel_url: `${siteUrl}/app/billing?canceled=1`,
  });

  if (!session.url) billingErrorRedirect(USER_ERRORS.CHECKOUT_FAILED);
  redirect(session.url);
}

export async function openBillingPortal(): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") {
    billingErrorRedirect(USER_ERRORS.BILLING_ADMIN_ONLY);
  }

  const stripe = getStripe();
  if (!stripe) billingErrorRedirect(USER_ERRORS.STRIPE_NOT_CONFIGURED);

  const org = await getOrgBillingFields(profile.organization_id);
  if (!org?.stripe_customer_id) {
    billingErrorRedirect(USER_ERRORS.NO_BILLING_ACCOUNT);
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${getSiteUrl()}/app/billing`,
  });

  redirect(portal.url);
}
