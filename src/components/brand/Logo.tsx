import { ScanText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.58_0.2_285)] text-primary-foreground shadow-md shadow-primary/25">
        <ScanText className="size-4" aria-hidden />
        <div
          className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-sm font-bold leading-none tracking-tight">
            Data Network
          </p>
          <p className="text-[11px] text-muted-foreground">AI Invoice OCR</p>
        </div>
      )}
    </div>
  );
}
