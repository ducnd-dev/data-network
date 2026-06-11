import type {
  DocumentType,
  ExtractedDocument,
  ExtractedGeneral,
  ExtractedInvoice,
  ExtractedReceipt,
} from "@/lib/ocr/types";

function isInvoice(doc: ExtractedDocument): doc is ExtractedInvoice {
  return "invoiceId" in doc || ("vendorName" in doc && !("merchantName" in doc));
}

function isReceipt(doc: ExtractedDocument): doc is ExtractedReceipt {
  return "merchantName" in doc;
}

function isGeneral(doc: ExtractedDocument): doc is ExtractedGeneral {
  return "fields" in doc && "documentType" in doc;
}

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function csvRow(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsv).join(",");
}

export function exportFileBaseName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "").trim() || "document";
  return base.replace(/[^\w.-]+/g, "-").slice(0, 80);
}

export function toJsonBlob(extracted: ExtractedDocument): Blob {
  return new Blob([JSON.stringify(extracted, null, 2)], {
    type: "application/json",
  });
}

export function toCsvBlob(
  extracted: ExtractedDocument,
  documentType?: DocumentType | null
): Blob {
  const lines: string[] = [];

  if (isInvoice(extracted)) {
    lines.push(
      csvRow(["field", "value"]),
      csvRow(["vendor", extracted.vendorName]),
      csvRow(["invoice_id", extracted.invoiceId]),
      csvRow(["invoice_date", extracted.invoiceDate]),
      csvRow(["due_date", extracted.dueDate]),
      csvRow(["subtotal", extracted.subtotal]),
      csvRow(["tax", extracted.totalTax]),
      csvRow(["total", extracted.invoiceTotal]),
      csvRow(["currency", extracted.currency ?? "AUD"]),
      csvRow(["confidence", extracted.confidenceScore]),
      ""
    );
    if (extracted.lineItems.length) {
      lines.push(csvRow(["line_description", "quantity", "unit_price", "amount"]));
      for (const item of extracted.lineItems) {
        lines.push(
          csvRow([item.description, item.quantity, item.unitPrice, item.amount])
        );
      }
    }
  } else if (isReceipt(extracted)) {
    lines.push(
      csvRow(["field", "value"]),
      csvRow(["merchant", extracted.merchantName]),
      csvRow(["date", extracted.transactionDate]),
      csvRow(["time", extracted.transactionTime]),
      csvRow(["subtotal", extracted.subtotal]),
      csvRow(["tax", extracted.totalTax]),
      csvRow(["total", extracted.total]),
      csvRow(["currency", extracted.currency ?? "AUD"]),
      csvRow(["confidence", extracted.confidenceScore]),
      ""
    );
    if (extracted.lineItems.length) {
      lines.push(csvRow(["line_description", "quantity", "unit_price", "amount"]));
      for (const item of extracted.lineItems) {
        lines.push(
          csvRow([item.description, item.quantity, item.unitPrice, item.amount])
        );
      }
    }
  } else if (isGeneral(extracted)) {
    lines.push(csvRow(["field", "value"]));
    lines.push(csvRow(["document_type", documentType ?? extracted.documentType]));
    if (extracted.title) lines.push(csvRow(["title", extracted.title]));
    if (extracted.summary) lines.push(csvRow(["summary", extracted.summary]));
    for (const [key, value] of Object.entries(extracted.fields)) {
      lines.push(csvRow([key, value]));
    }
    lines.push(csvRow(["confidence", extracted.confidenceScore]), "");
    if (extracted.lineItems.length) {
      lines.push(csvRow(["line_description", "quantity", "unit_price", "amount"]));
      for (const item of extracted.lineItems) {
        lines.push(
          csvRow([item.description, item.quantity, item.unitPrice, item.amount])
        );
      }
    }
  } else {
    lines.push(csvRow(["field", "value"]));
    lines.push(csvRow(["raw", JSON.stringify(extracted)]));
  }

  return new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
}
