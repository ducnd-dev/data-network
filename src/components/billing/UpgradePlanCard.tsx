import { Check } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { planLabel, type OrgPlan, PLAN_FEATURES } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const PLAN_CHECKLIST: Record<Exclude<OrgPlan, "free">, string[]> = {
  pro: [
    `${PLAN_FEATURES.pro.pages.toLocaleString()} page credits / month`,
    "All document types (general = 2× credits)",
    "Confidence scores on every field",
  ],
  business: [
    `${PLAN_FEATURES.business.pages.toLocaleString()} page credits / month`,
    "All document types (general = 2× credits)",
    "High-volume OCR with smart field extraction",
  ],
};

export function UpgradePlanCard({
  plan,
  checkoutAction,
}: {
  plan: Exclude<OrgPlan, "free">;
  checkoutAction: () => Promise<void>;
}) {
  const details = PLAN_FEATURES[plan];
  const isPro = plan === "pro";

  return (
    <Card
      className={cn(
        "relative h-full overflow-hidden transition-shadow duration-300",
        isPro && "border-primary/30 bg-gradient-to-b from-primary/5 to-card glow-primary"
      )}
    >
      {isPro && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[oklch(0.65_0.18_285)] to-[oklch(0.7_0.14_200)]" />
      )}
      {isPro && (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Popular
        </span>
      )}
      <CardHeader>
        <CardTitle className="font-display text-xl">{planLabel(plan)}</CardTitle>
        <CardDescription>{details.description}</CardDescription>
        <p className="pt-2 font-display text-3xl font-semibold tracking-tight">
          {details.price}
          <span className="text-sm font-normal text-muted-foreground">/mo USD</span>
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {PLAN_CHECKLIST[plan].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form action={checkoutAction} className="w-full">
          <SubmitButton className="w-full" pendingLabel="Redirecting to checkout…">
            Upgrade to {planLabel(plan)}
          </SubmitButton>
        </form>
      </CardFooter>
    </Card>
  );
}
