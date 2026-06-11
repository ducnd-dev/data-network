import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ScanText, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Phase 1 — Invoice OCR SaaS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Turn invoices into structured data in seconds
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Upload PDFs and receipts. Azure Document Intelligence extracts vendor, dates,
            line items, and totals — ready for your bookkeeping workflow.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Start free — 20 credits/month</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {[
            {
              icon: ScanText,
              title: "Azure-powered OCR",
              description:
                "Prebuilt invoice model with confidence scores on every field.",
            },
            {
              icon: Shield,
              title: "Multi-tenant by design",
              description:
                "Organization-scoped data with Supabase RLS from day one.",
            },
            {
              icon: Zap,
              title: "Built to scale",
              description:
                "Roadmap: AI export, human verify, data network, marketplace.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="size-5 text-primary" aria-hidden />
                <CardTitle className="mt-3">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              From paper to structured JSON
            </h2>
            <p className="mt-4 text-muted-foreground">
              Bookkeepers and SMEs spend hours re-keying invoice data. Data Network
              automates extraction so you can review, export, and integrate — starting
              with invoices and receipts.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Vendor, invoice ID, dates, tax, and totals",
                "Line items with quantity and amounts",
                "Confidence scores to flag low-quality scans",
                "Usage-metered plans with Stripe billing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>2026 Roadmap</CardTitle>
              <CardDescription>Six phases, one platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                "Phase 1 — OCR SaaS",
                "Phase 2 — AI OCR + Export",
                "Phase 3 — Human Verify",
                "Phase 4 — Data Network",
                "Phase 5 — Marketplace",
                "Phase 6 — AI To Earn",
              ].map((phase, index) => (
                <div
                  key={phase}
                  className={`rounded-lg px-3 py-2 ${index === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
                >
                  {phase}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
