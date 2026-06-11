import Link from "next/link";
import { Upload, ScanLine, Download, ArrowRight } from "lucide-react";
import { GradientOrbs } from "@/components/marketing/GradientOrbs";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BRAND_NAME,
  BRAND_POSITIONING,
  BRAND_ROADMAP,
  BRAND_STORY_SHORT,
  BRAND_TAGLINE,
} from "@/lib/copy";

export const metadata = {
  title: "About",
  description: `${BRAND_STORY_SHORT} Learn how ${BRAND_NAME} works and where we're heading.`,
};

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drop a PDF or image — invoice, receipt, or general document on paid plans.",
  },
  {
    icon: ScanLine,
    title: "Extract",
    description:
      "We pull vendor, dates, line items, and totals with a confidence score on every field.",
  },
  {
    icon: Download,
    title: "Export",
    description: "Review in your dashboard, then download JSON or CSV for your workflow.",
  },
];

const stack = [
  "Next.js 16 · React 19 · TypeScript",
  "Supabase Auth + Postgres with row-level security",
  "Azure Document Intelligence for invoice/receipt OCR",
  "OpenAI for document classification and general extraction",
  "Cloudflare R2 for secure file storage",
  "Stripe billing with usage-based page credits",
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <GradientOrbs />
      <div className="grid-pattern absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">About {BRAND_NAME}</p>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            {BRAND_POSITIONING}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{BRAND_STORY_SHORT}</p>
        </FadeIn>

        <section className="mt-20">
          <FadeIn className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">{BRAND_TAGLINE}</p>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.title}>
                  <Card className="h-full border-primary/10 bg-card/80">
                    <CardHeader>
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <CardTitle className="font-display mt-3">
                        {index + 1}. {step.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        <section className="mt-20">
          <FadeIn>
            <Card className="border-primary/10 bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Built in the open</CardTitle>
                <CardDescription>
                  A production SaaS stack — transparent for customers who care about security, and
                  for engineers who want to see how it&apos;s built.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {stack.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted-foreground">
                  Multi-tenant by design: every organisation&apos;s documents are isolated with
                  Supabase RLS. Usage is metered by page credits so you only pay for what you
                  process.
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        <section className="mt-20">
          <FadeIn>
            <h2 className="font-display text-center text-2xl font-bold tracking-tight md:text-3xl">
              Where we&apos;re heading
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Phase 1 is live today. The roadmap below shows how {BRAND_NAME} grows from invoice OCR
              into a broader data platform.
            </p>
            <div className="relative mx-auto mt-10 max-w-lg">
              <div
                className="absolute bottom-4 left-[1.65rem] top-4 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent"
                aria-hidden
              />
              {BRAND_ROADMAP.map((phase, index) => (
                <div
                  key={phase}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 pl-10 ${
                    index === 0
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`absolute left-3.5 size-2.5 rounded-full border-2 ${
                      index === 0
                        ? "border-primary bg-primary shadow-[0_0_8px_oklch(0.55_0.2_255/0.6)]"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                    aria-hidden
                  />
                  {phase}
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        <FadeIn className="mt-20 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Try it with your own invoices
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free — no credit card required.
          </p>
          <Button size="lg" className="mt-6 gap-2 glow-primary" asChild>
            <Link href="/signup">
              Create free account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </div>
  );
}
