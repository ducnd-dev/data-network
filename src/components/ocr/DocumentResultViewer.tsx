import { DocumentTypeBadge } from "@/components/ocr/DocumentTypeBadge";
import { InvoiceResultViewer } from "@/components/ocr/InvoiceResultViewer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ExtractedDocument,
  ExtractedGeneral,
  ExtractedReceipt,
} from "@/lib/ocr/types";
import { formatDate } from "@/lib/utils";

function isGeneralDocumentType(type: string | null | undefined): boolean {
  return (
    type === "general" ||
    type === "unknown" ||
    type === "purchase_order" ||
    type === "bank_statement"
  );
}

function GeneralResultViewer({
  extracted,
  fileName,
}: {
  extracted: ExtractedGeneral;
  fileName: string;
}) {
  const entries = Object.entries(extracted.fields ?? {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{fileName}</h1>
        <p className="text-sm text-muted-foreground">
          {extracted.title ?? extracted.summary ?? "General document extraction"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted fields</CardTitle>
          <CardDescription>AI-enhanced extraction from layout OCR</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No structured fields found.</p>
          ) : (
            <dl className="space-y-3">
              {entries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
                  <dt className="text-sm text-muted-foreground">{key}</dt>
                  <dd className="text-sm font-medium">{String(value ?? "—")}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {extracted.lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extracted.lineItems.map((item, index) => (
                  <TableRow key={`${item.description}-${index}`}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.amount ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReceiptResultViewer({
  extracted,
  fileName,
  overallConfidence,
}: {
  extracted: ExtractedReceipt;
  fileName: string;
  overallConfidence?: number | null;
}) {
  const currency = extracted.currency ?? "AUD";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{fileName}</h1>
          <p className="text-sm text-muted-foreground">Receipt extraction</p>
        </div>
        {overallConfidence != null && (
          <Badge variant="secondary">{Math.round(overallConfidence * 100)}% confidence</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-muted-foreground">Merchant: </span>
            {extracted.merchantName ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Date: </span>
            {formatDate(extracted.transactionDate)}
          </p>
          <p>
            <span className="text-muted-foreground">Total: </span>
            {extracted.total != null
              ? `${currency} ${extracted.total.toFixed(2)}`
              : "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DocumentResultViewer({
  extracted,
  fileName,
  documentType,
  creditsCharged,
  overallConfidence,
}: {
  extracted: ExtractedDocument;
  fileName: string;
  documentType?: string | null;
  creditsCharged?: number | null;
  overallConfidence?: number | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <DocumentTypeBadge type={documentType} />
        {creditsCharged != null && (
          <Badge variant="outline">
            {creditsCharged} page credit{creditsCharged === 1 ? "" : "s"} charged
          </Badge>
        )}
      </div>

      {documentType === "receipt" ? (
        <ReceiptResultViewer
          extracted={extracted as ExtractedReceipt}
          fileName={fileName}
          overallConfidence={overallConfidence}
        />
      ) : isGeneralDocumentType(documentType) ? (
        <GeneralResultViewer
          extracted={extracted as ExtractedGeneral}
          fileName={fileName}
        />
      ) : (
        <InvoiceResultViewer
          extracted={extracted}
          fileName={fileName}
          overallConfidence={overallConfidence}
        />
      )}
    </div>
  );
}
