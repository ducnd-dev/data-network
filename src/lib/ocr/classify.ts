import { openAiComplete, isOpenAiConfigured } from "@/lib/ai/openai";
import type { ClassificationResult, DocumentType } from "./types";

const VALID_TYPES: DocumentType[] = [
  "invoice",
  "receipt",
  "purchase_order",
  "bank_statement",
  "general",
  "unknown",
];

function classifyFromFileName(fileName: string): ClassificationResult | null {
  const name = fileName.toLowerCase();

  if (/invoice|inv[-_]|tax.?invoice|facture/.test(name)) {
    return { documentType: "invoice", confidence: 0.75, source: "heuristic" };
  }
  if (/receipt|rec[-_]|pos|eftpos/.test(name)) {
    return { documentType: "receipt", confidence: 0.75, source: "heuristic" };
  }
  if (/purchase.?order|\bpo[-_]|order.?confirmation/.test(name)) {
    return {
      documentType: "purchase_order",
      confidence: 0.7,
      source: "heuristic",
    };
  }
  if (/bank.?statement|statement|stmt/.test(name)) {
    return {
      documentType: "bank_statement",
      confidence: 0.7,
      source: "heuristic",
    };
  }

  return null;
}

function parseLlmClassification(text: string): ClassificationResult | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      documentType?: string;
      confidence?: number;
    };
    const type = parsed.documentType as DocumentType;
    if (!VALID_TYPES.includes(type)) return null;
    return {
      documentType: type,
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.7)),
      source: "llm",
    };
  } catch {
    return null;
  }
}

async function classifyWithLlm(
  buffer: Buffer,
  mimeType: string
): Promise<ClassificationResult | null> {
  if (!isOpenAiConfigured()) return null;
  if (mimeType === "application/pdf") return null;

  const model = process.env.OCR_CLASSIFY_MODEL ?? "gpt-4o-mini";
  const base64 = buffer.toString("base64");
  const mediaType = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpeg";

  const { text } = await openAiComplete({
    model,
    maxTokens: 120,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Classify this document image. Reply JSON only: {"documentType":"invoice|receipt|purchase_order|bank_statement|general","confidence":0.0-1.0}',
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/${mediaType};base64,${base64}`,
              detail: "low",
            },
          },
        ],
      },
    ],
  });

  return parseLlmClassification(text);
}

export async function classifyDocument(params: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}): Promise<ClassificationResult> {
  const heuristic = classifyFromFileName(params.fileName);
  if (heuristic && heuristic.confidence >= 0.7) {
    return heuristic;
  }

  const llm = await classifyWithLlm(params.buffer, params.mimeType);
  if (llm && llm.confidence >= 0.6) {
    return llm;
  }

  if (heuristic) return heuristic;
  if (llm) return llm;

  return {
    documentType: "invoice",
    confidence: 0.5,
    source: "heuristic",
  };
}
