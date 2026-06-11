import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { getOrgBilling } from "@/lib/billing/get-org-billing";
import { getOrgUsage } from "@/lib/usage/limits";
import { planLabel } from "@/lib/billing/plans";
import {
  openCustomerPortal,
  startBusinessCheckout,
  startProCheckout,
} from "@/app/(app)/app/billing/actions";
import { UpgradePlanCard } from "@/components/billing/UpgradePlanCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CREDITS_RESET_HINT, PRICING_NOTE, SUPPORT_EMAIL } from "@/lib/copy";
import { isPolarConfigured } from "@/lib/polar/is-configured";

export const metadata = {
  title: "Billing",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; subscribed?: string; canceled?: string }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const params = await searchParams;
  const plan = profile.organizations?.plan ?? "free";
  const usage = await getOrgUsage(profile.organization_id);
  const usagePercent = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const billing = await getOrgBilling(profile.organization_id);
  const isAdmin = profile.role === "admin";
  const polarReady = isPolarConfigured();
  const isPastDue = billing?.polar_subscription_status === "past_due";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and page credits"
      />

      {params.error && (
        <Alert variant="destructive">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      )}
      {params.subscribed && (
        <Alert>
          <AlertDescription>
            Payment received. Your subscription will activate shortly once processing completes.
          </AlertDescription>
        </Alert>
      )}
      {params.canceled && (
        <Alert>
          <AlertDescription>Checkout canceled. No changes were made.</AlertDescription>
        </Alert>
      )}
      {isPastDue && (
        <Alert variant="destructive">
          <AlertDescription>
            Your last payment failed. Please update your payment method in the billing portal or
            contact support.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {usage.used} of {usage.limit} page credits used this month. {CREDITS_RESET_HINT}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={plan === "free" ? "secondary" : "success"}>
            {planLabel(plan)}
          </Badge>
          <Progress value={usagePercent} />
          {billing?.billing_email && (
            <p className="text-sm text-muted-foreground">Billing email: {billing.billing_email}</p>
          )}
          {isAdmin && plan !== "free" && polarReady && (
            <form action={openCustomerPortal}>
              <SubmitButton variant="outline" pendingLabel="Opening portal…">
                Manage subscription
              </SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      {plan === "free" && isAdmin && (
        <>
          {!polarReady && (
            <Alert>
              <AlertDescription>
                Paid plans are not available online yet. Email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                to upgrade, or check back soon.
              </AlertDescription>
            </Alert>
          )}
          {polarReady && (
            <div className="grid gap-4 md:grid-cols-2">
              <UpgradePlanCard plan="pro" checkoutAction={startProCheckout} />
              <UpgradePlanCard plan="business" checkoutAction={startBusinessCheckout} />
            </div>
          )}
        </>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Contact your workspace admin to manage billing.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {PRICING_NOTE} Need help?{" "}
        <Link href="/pricing" className="underline">
          Compare plans
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline">
          contact support
        </Link>
        .
      </p>
    </div>
  );
}
