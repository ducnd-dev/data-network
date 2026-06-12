import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ExtractedDocument } from "@/lib/ocr/types";
import { DocumentResultViewer } from "@/components/ocr/DocumentResultViewer";
import { sanitizeErrorMessage } from "@/lib/errors/user-messages";
import { ProcessingAlert } from "@/components/ocr/ProcessingAlert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Document ${id.slice(0, 8)}` };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();
  if (!profile) return null;

  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: document } = await supabase
    .from("documents")
    .select("id, file_name, status, organization_id, document_type")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!document) notFound();

  const { data: job } = await supabase
    .from("ocr_jobs")
    .select(
      "extracted_data, confidence_score, error_message, status, credits_charged, pipeline_id"
    )
    .eq("document_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/app/documents">← Back to documents</Link>
      </Button>

      {document.status === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>Processing failed</AlertTitle>
          <AlertDescription>
            {sanitizeErrorMessage(job?.error_message)}
          </AlertDescription>
        </Alert>
      )}

      {(document.status === "classifying" ||
        document.status === "processing" ||
        document.status === "pending") && (
        <ProcessingAlert />
      )}

      {document.status === "completed" && job?.extracted_data && (
        <DocumentResultViewer
          extracted={job.extracted_data as ExtractedDocument}
          fileName={document.file_name}
          documentType={document.document_type}
          creditsCharged={job.credits_charged}
          overallConfidence={job.confidence_score}
        />
      )}
    </div>
  );
}
