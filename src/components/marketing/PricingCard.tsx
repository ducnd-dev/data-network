"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { planLabel, type OrgPlan } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function PricingCard({
  plan,
  details,
  index,
}: {
  plan: OrgPlan;
  details: {
    description: string;
    price: string;
    pages: number;
  };
  index: number;
}) {
  const isPro = plan === "pro";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="h-full"
    >
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
          <p className="pt-2 font-display text-4xl font-semibold tracking-tight">
            {details.price}
            {plan !== "free" && (
              <span className="text-sm font-normal text-muted-foreground">/mo AUD ex GST</span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              {details.pages.toLocaleString()} page credits / month
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              {plan === "free"
                ? "Invoice & receipt only (1× credits)"
                : "All document types (general = 2× credits)"}
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              Confidence scores
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant={isPro ? "default" : "outline"} asChild>
            <Link href="/signup">
              {plan === "free" ? "Start free" : `Get ${planLabel(plan)}`}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
