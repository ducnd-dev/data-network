import {
  AzureKeyCredential,
  DocumentAnalysisClient,
  type AnalyzeResult,
} from "@azure/ai-form-recognizer";
import { mapAzureInvoiceToExtracted } from "./extract-invoice";
import { mapAzureReceiptToExtracted } from "./extract-receipt";
import type { ExtractedDocument, ExtractedGeneral } from "./types";

export function isAzureOcrConfigured(): boolean {
  return Boolean(
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT &&
      process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
  );
}

function getAzureClient(): DocumentAnalysisClient | null {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT?.trim();
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY?.trim();
  if (!endpoint || !key) return null;
  return new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
}

export async function analyzeDocument(
  modelId: string,
  fileBuffer: Buffer
): Promise<AnalyzeResult> {
  const client = getAzureClient();
  if (!client) {
    throw new Error(
      "Azure Document Intelligence is not configured. Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY."
    );
  }

  const poller = await client.beginAnalyzeDocument(modelId, fileBuffer);
  return poller.pollUntilDone();
}

export async function analyzeInvoiceDocument(
  fileBuffer: Buffer
): Promise<{ extracted: ExtractedDocument; raw: AnalyzeResult }> {
  const raw = await analyzeDocument("prebuilt-invoice", fileBuffer);
  const extracted = mapAzureInvoiceToExtracted(raw.documents ?? []);
  return { extracted, raw };
}

export async function analyzeReceiptDocument(
  fileBuffer: Buffer
): Promise<{ extracted: ExtractedDocument; raw: AnalyzeResult }> {
  const raw = await analyzeDocument("prebuilt-receipt", fileBuffer);
  const extracted = mapAzureReceiptToExtracted(raw.documents ?? []);
  return { extracted, raw };
}

export async function analyzeLayoutDocument(
  fileBuffer: Buffer
): Promise<{ extracted: ExtractedGeneral; raw: AnalyzeResult }> {
  const raw = await analyzeDocument("prebuilt-layout", fileBuffer);
  const content = raw.content?.slice(0, 4000) ?? "";
  const tables = raw.tables?.length ?? 0;

  return {
    extracted: {
      documentType: "general",
      summary: content.slice(0, 500),
      fields: {
        pageCount: raw.pages?.length ?? 1,
        tableCount: tables,
      },
      lineItems: [],
      confidenceScore: 0.6,
    },
    raw,
  };
}

/** @deprecated Use analyzeInvoiceDocument */
export async function analyzeInvoiceDocumentLegacy(
  fileBuffer: Buffer,
  _contentType?: string
) {
  return analyzeInvoiceDocument(fileBuffer);
}
