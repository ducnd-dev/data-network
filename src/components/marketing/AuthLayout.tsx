"use client";

import { motion } from "framer-motion";
import { GradientOrbs } from "@/components/marketing/GradientOrbs";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <GradientOrbs />
      <div className="grid-pattern absolute inset-0 opacity-50" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
}
