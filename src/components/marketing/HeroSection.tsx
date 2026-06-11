"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientOrbs } from "@/components/marketing/GradientOrbs";
import { HeroScene } from "@/components/marketing/HeroScene";

export function HeroSection() {
  return (
    <section className="mesh-bg relative overflow-hidden">
      <GradientOrbs />
      <div className="grid-pattern absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28 lg:gap-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" aria-hidden />
              Invoice OCR for bookkeepers & SMEs
            </span>
          </motion.div>

          <motion.h1
            className="font-display mt-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Turn invoices into{" "}
            <span className="text-gradient">structured data</span> in seconds
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Upload PDFs and receipts. Azure Document Intelligence extracts vendor, dates,
            line items, and totals — ready for your bookkeeping workflow.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button size="lg" className="group gap-2 glow-primary" asChild>
              <Link href="/signup">
                Start free — 20 credits/month
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {["No credit card", "Azure OCR", "Multi-tenant RLS"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <HeroScene />
      </div>
    </section>
  );
}
