import type { AnalyzedDocument } from "@azure/ai-form-recognizer";
import type { ExtractedInvoice, InvoiceLineItem } from "./types";

function fieldValue(
  doc: AnalyzedDocument,
  fieldName: string
): { value?: string | number; confidence?: number } {
  const field = doc.fields?.[fieldName];
  if (!field) return {};

  if (field.kind === "currency" && field.value) {
    return {
      value: field.value.amount,
      confidence: field.confidence,
    };
  }

  if (field.kind === "date" && field.value) {
    return {
      value: field.value.toISOString().slice(0, 10),
      confidence: field.confidence,
    };
  }

  if (field.kind === "number" && field.value != null) {
    return { value: field.value, confidence: field.confidence };
  }

  if (field.kind === "string" && field.value) {
    return { value: field.value, confidence: field.confidence };
  }

  if (field.kind === "address" && field.value) {
    const parts = [
      field.value.streetAddress,
      field.value.city,
      field.value.state,
      field.value.postalCode,
      field.value.countryRegion,
    ].filter(Boolean);
    return { value: parts.join(", "), confidence: field.confidence };
  }

  return {};
}

function extractLineItems(doc: AnalyzedDocument): InvoiceLineItem[] {
  const itemsField = doc.fields?.Items;
  if (!itemsField || itemsField.kind !== "array" || !itemsField.values) {
    return [];
  }

  const lineItems: InvoiceLineItem[] = [];

  for (const item of itemsField.values) {
    if (item.kind !== "object" || !item.properties) continue;
    const props = item.properties;
    const description =
      props.Description?.kind === "string" ? props.Description.value : undefined;
    const quantity =
      props.Quantity?.kind === "number" ? props.Quantity.value : undefined;
    const unitPrice =
      props.UnitPrice?.kind === "currency"
        ? props.UnitPrice.value?.amount
        : undefined;
    const amount =
      props.Amount?.kind === "currency" ? props.Amount.value?.amount : undefined;

    if (!description) continue;

    const confidences = [
      props.Description?.confidence,
      props.Quantity?.confidence,
      props.UnitPrice?.confidence,
      props.Amount?.confidence,
    ].filter((c): c is number => typeof c === "number");

    lineItems.push({
      description,
      quantity,
      unitPrice,
      amount,
      confidence:
        confidences.length > 0
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : undefined,
    });
  }

  return lineItems;
}

export function mapAzureInvoiceToExtracted(
  documents: AnalyzedDocument[]
): ExtractedInvoice {
  const doc = documents[0];
  if (!doc) {
    return { lineItems: [], confidenceScore: 0 };
  }

  const vendorName = fieldValue(doc, "VendorName");
  const vendorAddress = fieldValue(doc, "VendorAddress");
  const customerName = fieldValue(doc, "CustomerName");
  const customerAddress = fieldValue(doc, "CustomerAddress");
  const invoiceId = fieldValue(doc, "InvoiceId");
  const invoiceDate = fieldValue(doc, "InvoiceDate");
  const dueDate = fieldValue(doc, "DueDate");
  const subtotal = fieldValue(doc, "SubTotal");
  const totalTax = fieldValue(doc, "TotalTax");
  const invoiceTotal = fieldValue(doc, "InvoiceTotal");

  const currencyField = doc.fields?.InvoiceTotal;
  const currency =
    currencyField?.kind === "currency" ? currencyField.value?.currencyCode : undefined;

  const lineItems = extractLineItems(doc);

  const fieldConfidences = [
    vendorName.confidence,
    invoiceId.confidence,
    invoiceDate.confidence,
    invoiceTotal.confidence,
    ...lineItems.map((i) => i.confidence),
  ].filter((c): c is number => typeof c === "number");

  const confidenceScore =
    fieldConfidences.length > 0
      ? fieldConfidences.reduce((a, b) => a + b, 0) / fieldConfidences.length
      : doc.confidence ?? 0;

  return {
    vendorName: vendorName.value != null ? String(vendorName.value) : undefined,
    vendorAddress:
      vendorAddress.value != null ? String(vendorAddress.value) : undefined,
    customerName:
      customerName.value != null ? String(customerName.value) : undefined,
    customerAddress:
      customerAddress.value != null ? String(customerAddress.value) : undefined,
    invoiceId: invoiceId.value != null ? String(invoiceId.value) : undefined,
    invoiceDate:
      invoiceDate.value != null ? String(invoiceDate.value) : undefined,
    dueDate: dueDate.value != null ? String(dueDate.value) : undefined,
    subtotal: typeof subtotal.value === "number" ? subtotal.value : undefined,
    totalTax: typeof totalTax.value === "number" ? totalTax.value : undefined,
    invoiceTotal:
      typeof invoiceTotal.value === "number" ? invoiceTotal.value : undefined,
    currency,
    lineItems,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
  };
}
