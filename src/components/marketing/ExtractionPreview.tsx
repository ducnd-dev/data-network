"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fields = [
  { label: "Vendor", value: "ACME Supplies Pty Ltd", confidence: 0.98 },
  { label: "Invoice ID", value: "INV-2026-0847", confidence: 0.99 },
  { label: "Invoice date", value: "04 Jun 2026", confidence: 0.97 },
  { label: "Due date", value: "18 Jun 2026", confidence: 0.96 },
  { label: "Subtotal", value: "$142.68", confidence: 0.95 },
  { label: "GST", value: "$14.27", confidence: 0.94 },
  { label: "Total", value: "$156.95", confidence: 0.98 },
];

export function ExtractionPreview() {
  return (
    <Card className="glass-card overflow-hidden border-primary/10">
      <CardHeader className="border-b border-border/40 bg-muted/30">
        <CardTitle className="font-display text-lg">Extracted fields</CardTitle>
        <CardDescription>Sample output — download JSON or CSV from your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {field.label}
              </p>
              <p className="truncate text-sm font-medium">{field.value}</p>
            </div>
            <Badge
              variant={field.confidence >= 0.97 ? "success" : "secondary"}
              className="shrink-0 tabular-nums"
            >
              {Math.round(field.confidence * 100)}%
            </Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
