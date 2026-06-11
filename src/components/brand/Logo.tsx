import { BRAND_NAME } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/LogoMark";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("group flex items-center gap-2.5", className)}>
      <LogoMark size={36} className="shadow-md shadow-primary/25" />
      {!compact && (
        <div>
          <p className="font-display text-sm font-bold leading-none tracking-tight">
            {BRAND_NAME}
          </p>
          <p className="text-[11px] text-muted-foreground">Invoice OCR</p>
        </div>
      )}
    </div>
  );
}
