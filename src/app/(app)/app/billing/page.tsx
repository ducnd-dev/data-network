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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage</p>
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
            {usage.used} of {usage.limit} page credits used this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={plan === "free" ? "secondary" : "success"}>
            {planLabel(plan)}
          </Badge>
          {isAdmin && plan !== "free" && (
            <form action={openBillingPortal}>
              <Button type="submit" variant="outline">
                Manage subscription
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {plan === "free" && isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>
                {PLAN_FEATURES.pro.price}/mo — {PLAN_FEATURES.pro.pages} pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={startProCheckout}>
                <Button type="submit" className="w-full">
                  Upgrade to Pro
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>
                {PLAN_FEATURES.business.price}/mo — {PLAN_FEATURES.business.pages} pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={startBusinessCheckout}>
                <Button type="submit" className="w-full">
                  Upgrade to Business
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Contact your workspace admin to manage billing.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Need help? See{" "}
        <Link href="/pricing" className="underline">
          pricing
        </Link>{" "}
        for plan details.
      </p>
    </div>
  );
}
