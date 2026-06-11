import { Badge } from "@/components/ui/badge";
import { documentTypeLabel } from "@/lib/billing/unit-economics";

export function DocumentTypeBadge({ type }: { type: string | null | undefined }) {
  const label = documentTypeLabel(type);
  const variant =
    type === "invoice" || type === "receipt"
      ? "success"
      : type === "general" || type === "unknown"
        ? "warning"
        : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}
