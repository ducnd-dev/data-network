import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { getOrgUsage } from "@/lib/usage/limits";
import { PLAN_FEATURES, planLabel } from "@/lib/billing/plans";
import {
  openBillingPortal,
  startBusinessCheckout,
  startProCheckout,
} from "@/app/(app)/app/billing/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDITS_RESET_HINT, PRICING_GST_NOTE, SUPPORT_EMAIL } from "@/lib/copy";
import { isStripeConfigured } from "@/lib/stripe/is-configured";

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
  const isAdmin = profile.role === "admin";
  const stripeReady = isStripeConfigured();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and page credits</p>
      </div>

      {params.error && (
        <Alert variant="destructive">
          <AlertDescription>{params.error}</AlertDescription>
        </Alert>
      )}
      {params.subscribed && (
        <Alert>
          <AlertDescription>Subscription activated. Thank you!</AlertDescription>
        </Alert>
      )}
      {params.canceled && (
        <Alert>
          <AlertDescription>Checkout canceled. No changes were made.</AlertDescription>
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
          {isAdmin && plan !== "free" && stripeReady && (
            <form action={openBillingPortal}>
              <SubmitButton variant="outline" pendingLabel="Opening portal…">
                Manage subscription
              </SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      {plan === "free" && isAdmin && (
        <>
          {!stripeReady && (
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
          {stripeReady && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>
                    {PLAN_FEATURES.pro.price}/mo AUD ex GST —{" "}
                    {PLAN_FEATURES.pro.pages.toLocaleString()} page credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={startProCheckout}>
                    <SubmitButton className="w-full" pendingLabel="Redirecting to checkout…">
                      Upgrade to Pro
                    </SubmitButton>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Business</CardTitle>
                  <CardDescription>
                    {PLAN_FEATURES.business.price}/mo AUD ex GST —{" "}
                    {PLAN_FEATURES.business.pages.toLocaleString()} page credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={startBusinessCheckout}>
                    <SubmitButton className="w-full" pendingLabel="Redirecting to checkout…">
                      Upgrade to Business
                    </SubmitButton>
                  </form>
                </CardContent>
              </Card>
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
        {PRICING_GST_NOTE} Need help?{" "}
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
