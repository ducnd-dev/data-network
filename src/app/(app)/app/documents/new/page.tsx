import { DocumentUploadForm } from "@/components/upload/DocumentUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDITS_EXPLAINER } from "@/lib/copy";

export const metadata = {
  title: "Upload document",
};

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload document</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          PDF, JPEG, PNG, or WebP up to 10MB. Free plan: invoices and receipts only.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{CREDITS_EXPLAINER}</p>
      </div>
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
