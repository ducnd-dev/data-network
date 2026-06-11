"use client";

import { Download, ScanText, Shield } from "lucide-react";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/FadeIn";

const features = [
  {
    icon: ScanText,
    title: "Accurate invoice capture",
    description:
      "Extract vendor, dates, line items, and totals with a confidence score on every field.",
  },
  {
    icon: Shield,
    title: "Private to your workspace",
    description:
      "Your documents stay isolated to your organisation. Only your team can access them.",
  },
  {
    icon: Download,
    title: "Review and export",
    description:
      "Check extracted fields in the app, then download results as JSON or CSV for your workflow.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative border-y border-border/60 bg-muted/20 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4">
        <FadeIn className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to digitize invoices
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Built for Australian bookkeepers and SMEs — simple uploads, clear results, and
            straightforward monthly plans.
          </p>
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-3">
          {features.map((item) => (
            <StaggerItem key={item.title}>
              <FeatureCard {...item} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
