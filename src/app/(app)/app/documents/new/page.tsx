import { DocumentUploadForm } from "@/components/upload/DocumentUploadForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDITS_EXPLAINER } from "@/lib/copy";

export const metadata = {
  title: "Upload document",
};

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Upload document"
        description={`PDF, JPEG, PNG, or WebP up to 10MB. Free plan: invoices and receipts only. ${CREDITS_EXPLAINER}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>New document</CardTitle>
          <CardDescription>
            We extract vendor, dates, line items, and totals with confidence scores on each
            field.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
