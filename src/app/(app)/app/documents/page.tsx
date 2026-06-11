import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DocumentMobileList } from "@/components/app/DocumentListItem";
import { DocumentTypeBadge } from "@/components/ocr/DocumentTypeBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Upload } from "lucide-react";

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

  const count = documents?.length ?? 0;
  const subtitle =
    count === 0
      ? "All uploaded invoices and receipts"
      : `${count} document${count === 1 ? "" : "s"} uploaded`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description={subtitle}
        action={
          <Button asChild>
            <Link href="/app/documents/new">
              <Upload className="size-4" aria-hidden />
              Upload
            </Link>
          </Button>
        }
      />

      {!documents?.length ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload invoices and receipts to extract structured data with confidence scores."
          actionLabel="Upload your first invoice"
          actionHref="/app/documents/new"
        />
      ) : (
        <>
          <DocumentMobileList documents={documents} />

          <Card className="hidden md:block">
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
