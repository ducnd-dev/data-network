import type { AnalyzedDocument } from "@azure/ai-form-recognizer";
import type { ExtractedReceipt } from "./types";

function fieldString(
  doc: AnalyzedDocument,
  fieldName: string
): { value?: string; confidence?: number } {
  const field = doc.fields?.[fieldName];
  if (!field) return {};
  if (field.kind === "string" && field.value) {
    return { value: field.value, confidence: field.confidence };
  }
  if (field.kind === "date" && field.value) {
    return {
      value: field.value.toISOString().slice(0, 10),
      confidence: field.confidence,
    };
  }
  if (field.kind === "time" && field.value) {
    return { value: String(field.value), confidence: field.confidence };
  }
  if (field.kind === "currency" && field.value) {
    return {
      value: String(field.value.amount),
      confidence: field.confidence,
    };
  }
  return {};
}

export function mapAzureReceiptToExtracted(
  documents: AnalyzedDocument[]
): ExtractedReceipt {
  const doc = documents[0];
  if (!doc) {
    return { lineItems: [], confidenceScore: 0 };
  }

  const merchant = fieldString(doc, "MerchantName");
  const date = fieldString(doc, "TransactionDate");
  const time = fieldString(doc, "TransactionTime");
  const subtotal = fieldString(doc, "Subtotal");
  const tax = fieldString(doc, "TotalTax");
  const total = fieldString(doc, "Total");

  const totalField = doc.fields?.Total;
  const currency =
    totalField?.kind === "currency" ? totalField.value?.currencyCode : undefined;

  const confidences = [
    merchant.confidence,
    date.confidence,
    total.confidence,
    doc.confidence,
  ].filter((c): c is number => typeof c === "number");

  return {
    merchantName: merchant.value,
    transactionDate: date.value,
    transactionTime: time.value,
    subtotal: subtotal.value ? Number(subtotal.value) : undefined,
    totalTax: tax.value ? Number(tax.value) : undefined,
    total: total.value ? Number(total.value) : undefined,
    currency,
    lineItems: [],
    confidenceScore:
      confidences.length > 0
        ? Math.round(
            (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100
          ) / 100
        : 0,
  };
}
