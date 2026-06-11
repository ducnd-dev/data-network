"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ScanLine } from "lucide-react";
import { useRef } from "react";

function InvoiceMock() {
  return (
    <div className="space-y-2 p-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
      <div className="flex justify-between border-b border-border/60 pb-2">
        <span className="font-semibold text-foreground">ACME Supplies Pty Ltd</span>
        <span>INV-2026-0847</span>
      </div>
      <div className="grid grid-cols-2 gap-1 pt-1">
        <span>Date: 04 Jun 2026</span>
        <span>Due: 18 Jun 2026</span>
      </div>
      <div className="mt-2 space-y-1 rounded-md bg-muted/50 p-2">
        <div className="flex justify-between">
          <span>Office supplies</span>
          <span>$124.50</span>
        </div>
        <div className="flex justify-between">
          <span>Courier fee</span>
          <span>$18.00</span>
        </div>
      </div>
      <div className="flex justify-between pt-1 font-semibold text-foreground">
        <span>Total (inc. GST)</span>
        <span>$156.95</span>
      </div>
    </div>
  );
}

function JsonMock() {
  return (
    <pre className="overflow-hidden p-4 font-mono text-[9px] leading-relaxed text-primary/90">
      {`{
  "vendor": "ACME Supplies",
  "invoice_id": "INV-0847",
  "date": "2026-06-04",
  "total": 156.95,
  "confidence": 0.97,
  "line_items": [...]
}`}
    </pre>
  );
}

export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      className="perspective-1000 relative mx-auto mt-16 max-w-lg md:mt-0 md:max-w-none"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="preserve-3d relative flex items-center justify-center gap-4 md:gap-6"
        style={{ rotateX, rotateY }}
      >
        {/* Invoice card */}
        <motion.div
          className="glass-card relative w-44 shrink-0 overflow-hidden rounded-2xl md:w-52"
          style={{ transform: "translateZ(40px) rotateY(-12deg)" }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-x-0 h-px bg-primary/70 shadow-[0_0_12px_oklch(0.55_0.2_255/0.8)]"
              style={{ animation: "scan-line 3s ease-in-out infinite" }}
            />
          </div>
          <p className="border-b border-border/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            PDF Invoice
          </p>
          <InvoiceMock />
        </motion.div>

        {/* Scan connector */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-1"
          style={{ transform: "translateZ(60px)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground glow-primary">
            <ScanLine className="size-5" />
          </div>
          <ArrowRight className="size-4 text-primary md:rotate-0" aria-hidden />
          <span className="text-[10px] font-medium text-primary">OCR</span>
        </motion.div>

        {/* JSON card */}
        <motion.div
          className="glass-card relative w-44 shrink-0 overflow-hidden rounded-2xl border-primary/20 md:w-52"
          style={{ transform: "translateZ(40px) rotateY(12deg)" }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[oklch(0.65_0.18_285)] via-primary to-[oklch(0.7_0.14_200)]" />
          <p className="border-b border-border/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-primary">
            Structured data
          </p>
          <JsonMock />
        </motion.div>
      </motion.div>

      {/* Floating confidence badge */}
      <motion.div
        className="glass absolute -right-2 top-8 rounded-full px-3 py-1.5 text-xs font-medium text-primary shadow-lg md:right-8"
        style={{ transform: "translateZ(80px)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        97% confidence
      </motion.div>

      {/* Base glow */}
      <div
        className="absolute left-1/2 top-1/2 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
    </div>
  );
}
