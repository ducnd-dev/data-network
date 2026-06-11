import { DocumentUploadForm } from "@/components/upload/DocumentUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Upload invoice",
};

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload invoice</h1>
        <p className="text-sm text-muted-foreground">
          PDF, JPEG, or PNG up to 10MB. Invoices and receipts use 1× credits per page.
          Other document types use 2× credits. Free plan: invoice & receipt only.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New document</CardTitle>
          <CardDescription>
            Azure Document Intelligence will extract vendor, dates, line items, and totals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
