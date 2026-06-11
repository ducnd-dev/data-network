import { openAiComplete, isOpenAiConfigured } from "@/lib/ai/openai";
import type { DocumentType, ExtractedGeneral } from "@/lib/ocr/types";

export async function enhanceGeneralExtraction(params: {
  documentType: DocumentType;
  layoutText: string;
}): Promise<{
  extracted: ExtractedGeneral;
  tokensIn?: number;
  tokensOut?: number;
}> {
  if (!isOpenAiConfigured()) {
    return {
      extracted: {
        documentType: params.documentType,
        summary: params.layoutText.slice(0, 500),
        fields: { rawText: params.layoutText.slice(0, 2000) },
        lineItems: [],
        confidenceScore: 0.5,
      },
    };
  }

  const model = process.env.OCR_EXTRACT_MODEL ?? "gpt-4o-mini";
  const { text, tokensIn, tokensOut } = await openAiComplete({
    model,
    maxTokens: 1200,
    messages: [
      {
        role: "system",
        content:
          "Extract structured fields from OCR text. Use AUD and DD/MM/YYYY when possible. Reply JSON only.",
      },
      {
        role: "user",
        content: `Document type: ${params.documentType}\n\nOCR text:\n${params.layoutText.slice(0, 6000)}\n\nJSON schema: {"title":string,"summary":string,"fields":{...},"lineItems":[{"description":string,"amount":number}]}`,
      },
    ],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? text) as {
      title?: string;
      summary?: string;
      fields?: Record<string, string | number | null>;
      lineItems?: ExtractedGeneral["lineItems"];
    };

    return {
      extracted: {
        documentType: params.documentType,
        title: parsed.title,
        summary: parsed.summary ?? params.layoutText.slice(0, 300),
        fields: parsed.fields ?? {},
        lineItems: parsed.lineItems ?? [],
        confidenceScore: 0.75,
      },
      tokensIn,
      tokensOut,
    };
  } catch {
    return {
      extracted: {
        documentType: params.documentType,
        summary: params.layoutText.slice(0, 500),
        fields: { rawText: params.layoutText.slice(0, 2000) },
        lineItems: [],
        confidenceScore: 0.55,
      },
      tokensIn,
      tokensOut,
    };
  }
}
