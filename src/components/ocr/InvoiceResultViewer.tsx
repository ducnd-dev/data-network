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
import type { ExtractedInvoice } from "@/lib/ocr/types";
import { formatDate } from "@/lib/utils";

function confidenceBadge(score: number | undefined) {
  if (score == null) return <Badge variant="secondary">—</Badge>;
  if (score >= 0.9) return <Badge variant="success">{Math.round(score * 100)}%</Badge>;
  if (score >= 0.75) return <Badge variant="warning">{Math.round(score * 100)}%</Badge>;
  return <Badge variant="destructive">{Math.round(score * 100)}%</Badge>;
}

function FieldRow({
  label,
  value,
  confidence,
}: {
  label: string;
  value?: string | number;
  confidence?: number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm">{value ?? "—"}</p>
      </div>
      {confidence != null && confidenceBadge(confidence)}
    </div>
  );
}

export function InvoiceResultViewer({
  extracted,
  fileName,
  overallConfidence,
}: {
  extracted: ExtractedInvoice;
  fileName: string;
  overallConfidence?: number | null;
}) {
  const currency = extracted.currency ?? "AUD";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{fileName}</h1>
          <p className="text-sm text-muted-foreground">
            Extracted invoice data from Azure Document Intelligence
          </p>
        </div>
        {overallConfidence != null && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall confidence</p>
            <div className="mt-1">{confidenceBadge(overallConfidence)}</div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice details</CardTitle>
            <CardDescription>Header fields detected on the document</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldRow label="Vendor" value={extracted.vendorName} />
            <FieldRow label="Vendor address" value={extracted.vendorAddress} />
            <FieldRow label="Invoice ID" value={extracted.invoiceId} />
            <FieldRow label="Invoice date" value={formatDate(extracted.invoiceDate)} />
            <FieldRow label="Due date" value={formatDate(extracted.dueDate)} />
            <FieldRow label="Customer" value={extracted.customerName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
            <CardDescription>Amounts in {currency}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldRow
              label="Subtotal"
              value={
                extracted.subtotal != null
                  ? `${currency} ${extracted.subtotal.toFixed(2)}`
                  : undefined
              }
            />
            <FieldRow
              label="Tax"
              value={
                extracted.totalTax != null
                  ? `${currency} ${extracted.totalTax.toFixed(2)}`
                  : undefined
              }
            />
            <FieldRow
              label="Total"
              value={
                extracted.invoiceTotal != null
                  ? `${currency} ${extracted.invoiceTotal.toFixed(2)}`
                  : undefined
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>
            {extracted.lineItems.length} item{extracted.lineItems.length === 1 ? "" : "s"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {extracted.lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No line items detected.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extracted.lineItems.map((item, index) => (
                  <TableRow key={`${item.description}-${index}`}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity ?? "—"}</TableCell>
                    <TableCell>
                      {item.unitPrice != null
                        ? `${currency} ${item.unitPrice.toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {item.amount != null
                        ? `${currency} ${item.amount.toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell>{confidenceBadge(item.confidence)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
