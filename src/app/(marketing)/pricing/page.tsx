import { PricingCard } from "@/components/marketing/PricingCard";
import { GradientOrbs } from "@/components/marketing/GradientOrbs";
import { FadeIn } from "@/components/motion/FadeIn";
import { CREDITS_EXPLAINER, PRICING_GST_NOTE } from "@/lib/copy";
import { PLAN_FEATURES, type OrgPlan } from "@/lib/billing/plans";

const plans: OrgPlan[] = ["free", "pro", "business"];

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="mesh-bg relative overflow-hidden pb-20">
      <GradientOrbs />
      <div className="grid-pattern absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-16">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Transparent pricing</p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Simple pricing by <span className="text-gradient">page credits</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{CREDITS_EXPLAINER}</p>
          <p className="mt-2 text-sm text-muted-foreground">{PRICING_GST_NOTE}</p>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan}
              plan={plan}
              details={PLAN_FEATURES[plan]}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
