import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_FEATURES, type OrgPlan } from "@/lib/billing/plans";
import { Check } from "lucide-react";

const plans: OrgPlan[] = ["free", "pro", "business"];

export const metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Simple, usage-based pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Pay for pages processed. Upgrade when your volume grows.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const details = PLAN_FEATURES[plan];
          return (
            <Card key={plan} className={plan === "pro" ? "ring-2 ring-primary" : undefined}>
              <CardHeader>
                <CardTitle className="capitalize">{plan}</CardTitle>
                <CardDescription>{details.description}</CardDescription>
                <p className="pt-2 text-3xl font-semibold">
                  {details.price}
                  {plan !== "free" && (
                    <span className="text-sm font-normal text-muted-foreground">/mo AUD</span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" aria-hidden />
                    {details.pages.toLocaleString()} page credits / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" aria-hidden />
                    {plan === "free"
                      ? "Invoice & receipt only (1× credits)"
                      : "All document types (general = 2× credits)"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-primary" aria-hidden />
                    Confidence scores
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan === "pro" ? "default" : "outline"} asChild>
                  <Link href={plan === "free" ? "/signup" : "/signup"}>
                    {plan === "free" ? "Start free" : `Get ${plan}`}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
