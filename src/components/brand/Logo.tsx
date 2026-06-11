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
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ScanText className="size-4" aria-hidden />
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold leading-none">Data Network</p>
          <p className="text-xs text-muted-foreground">AI Invoice OCR</p>
        </div>
      )}
    </div>
  );
}
