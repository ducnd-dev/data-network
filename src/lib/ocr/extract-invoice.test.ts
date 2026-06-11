import { describe, expect, it } from "vitest";
import { mapAzureInvoiceToExtracted } from "./extract-invoice";
import type { AnalyzedDocument } from "@azure/ai-form-recognizer";

describe("mapAzureInvoiceToExtracted", () => {
  it("maps core invoice fields and line items", () => {
    const doc = {
      docType: "invoice",
      confidence: 0.92,
      fields: {
        VendorName: { kind: "string", value: "Acme Pty Ltd", confidence: 0.95 },
        InvoiceId: { kind: "string", value: "INV-001", confidence: 0.9 },
        InvoiceDate: {
          kind: "date",
          value: new Date("2026-01-15"),
          confidence: 0.88,
        },
        InvoiceTotal: {
          kind: "currency",
          value: { amount: 110, currencyCode: "AUD" },
          confidence: 0.93,
        },
        Items: {
          kind: "array",
          values: [
            {
              kind: "object",
              properties: {
                Description: {
                  kind: "string",
                  value: "Consulting",
                  confidence: 0.9,
                },
                Amount: {
                  kind: "currency",
                  value: { amount: 110, currencyCode: "AUD" },
                  confidence: 0.85,
                },
              },
            },
          ],
        },
      },
    } as unknown as AnalyzedDocument;

    const result = mapAzureInvoiceToExtracted([doc]);

    expect(result.vendorName).toBe("Acme Pty Ltd");
    expect(result.invoiceId).toBe("INV-001");
    expect(result.invoiceDate).toBe("2026-01-15");
    expect(result.invoiceTotal).toBe(110);
    expect(result.currency).toBe("AUD");
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0]?.description).toBe("Consulting");
    expect(result.confidenceScore).toBeGreaterThan(0);
  });

  it("returns empty result when no documents", () => {
    const result = mapAzureInvoiceToExtracted([]);
    expect(result.lineItems).toEqual([]);
    expect(result.confidenceScore).toBe(0);
  });
});
