import Link from "next/link";
import { DocumentTypeBadge } from "@/components/ocr/DocumentTypeBadge";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/lib/utils";

type DocumentRow = {
  id: string;
  file_name: string;
  file_size: number | null;
  status: string;
  created_at: string;
  document_type: string | null;
};

function statusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
}

export function DocumentMobileList({ documents }: { documents: DocumentRow[] }) {
  return (
    <div className="space-y-3 md:hidden">
      {documents.map((doc) => (
        <Link
          key={doc.id}
          href={`/app/documents/${doc.id}`}
          className="block rounded-xl border border-border/80 bg-card p-4 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-medium leading-snug">{doc.file_name}</p>
            <Badge variant={statusVariant(doc.status)} className="shrink-0">
              {doc.status}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {doc.document_type ? (
              <DocumentTypeBadge type={doc.document_type} />
            ) : (
              <span>—</span>
            )}
            {doc.file_size != null && <span>{formatBytes(doc.file_size)}</span>}
            <span>{formatDate(doc.created_at)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
