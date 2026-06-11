import Link from "next/link";
import { FileText } from "lucide-react";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { ExtractionPreview } from "@/components/marketing/ExtractionPreview";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";

const checklist = [
  "Vendor, invoice ID, dates, tax, and totals",
  "Line items with quantity and amounts",
  "Confidence scores to flag low-quality scans",
  "Usage-metered plans with Stripe billing",
];

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <FeaturesSection />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          <FadeIn>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              From paper to structured JSON
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Bookkeepers and SMEs spend hours re-keying invoice data. Data Network automates
              extraction so you can review, export, and integrate — starting with invoices and
              receipts.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <FileText className="size-3 text-primary" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15}>
            <ExtractionPreview />
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/60 py-20">
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-[oklch(0.65_0.18_285/0.08)] to-[oklch(0.7_0.14_200/0.08)] animate-gradient"
          aria-hidden
        />
        <FadeIn className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ready to automate your invoice workflow?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start with 20 free page credits per month. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="glow-primary" asChild>
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button size="lg" variant="outline" className="glass" asChild>
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
