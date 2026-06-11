"use client";

import { ScanText, Shield, Zap } from "lucide-react";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/FadeIn";

const features = [
  {
    icon: ScanText,
    title: "Azure-powered OCR",
    description: "Prebuilt invoice model with confidence scores on every field.",
  },
  {
    icon: Shield,
    title: "Multi-tenant by design",
    description: "Organization-scoped data with Supabase RLS from day one.",
  },
  {
    icon: Zap,
    title: "Fast turnaround",
    description: "Upload a PDF and get structured fields in seconds — ready to review or export.",
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
            Production-ready OCR pipeline with smart classification, usage metering, and
            enterprise-grade security.
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
