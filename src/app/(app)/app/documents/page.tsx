import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DocumentTypeBadge } from "@/components/ocr/DocumentTypeBadge";
import { formatDate, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const profile = await getSessionProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: documents } = supabase
    ? await supabase
        .from("documents")
        .select("id, file_name, file_size, status, created_at, document_type, page_count")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">All uploaded invoices and receipts</p>
        </div>
        <Button asChild>
          <Link href="/app/documents/new">
            <Upload className="size-4" aria-hidden />
            Upload
          </Link>
        </Button>
      </div>

      {!documents?.length ? (
        <p className="text-sm text-muted-foreground">
          No documents yet.{" "}
          <Link href="/app/documents/new" className="text-primary underline">
            Upload your first invoice
          </Link>
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Link
                    href={`/app/documents/${doc.id}`}
                    className="font-medium hover:underline"
                  >
                    {doc.file_name}
                  </Link>
                </TableCell>
                <TableCell>
                  {doc.document_type ? (
                    <DocumentTypeBadge type={doc.document_type} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{formatBytes(doc.file_size)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.status === "completed"
                        ? "success"
                        : doc.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(doc.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
