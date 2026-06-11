import { enhanceGeneralExtraction } from "@/lib/ai/extract-general";
import { creditsForDocument, estimateCogsAud } from "@/lib/billing/unit-economics";
import { countDocumentPages } from "@/lib/documents/page-count";
import { classifyDocument } from "./classify";
import {
  analyzeInvoiceDocument,
  analyzeLayoutDocument,
  analyzeReceiptDocument,
  analyzeDocument,
} from "./azure";
import { pipelineBlockedMessage, resolvePipeline } from "./router";
import type { PipelineRunResult } from "./types";

export async function runDocumentPipeline(params: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  plan: string;
  creditsRemaining: number;
}): Promise<PipelineRunResult> {
  const pageCount = countDocumentPages(params.buffer, params.mimeType);
  const classification = await classifyDocument({
    buffer: params.buffer,
    mimeType: params.mimeType,
    fileName: params.fileName,
  });

  const pipeline = resolvePipeline(classification.documentType, params.plan);
  const creditsCharged = creditsForDocument(pipeline.id, pageCount);

  const blockMessage = pipelineBlockedMessage(
    pipeline,
    params.plan,
    creditsCharged,
    params.creditsRemaining
  );
  if (blockMessage) {
    throw new Error(blockMessage);
  }

  let extracted: PipelineRunResult["extracted"];
  let raw: unknown;
  let confidenceScore = 0;
  let llmTokensIn: number | undefined;
  let llmTokensOut: number | undefined;

  switch (pipeline.id) {
    case "azure-invoice": {
      const result = await analyzeInvoiceDocument(params.buffer);
      extracted = result.extracted;
      raw = result.raw;
      confidenceScore = result.extracted.confidenceScore;
      break;
    }
    case "azure-receipt": {
      const result = await analyzeReceiptDocument(params.buffer);
      extracted = result.extracted;
      raw = result.raw;
      confidenceScore = result.extracted.confidenceScore;
      break;
    }
    case "azure-bank-statement": {
      const azureRaw = await analyzeDocument(
        pipeline.azureModel,
        params.buffer
      );
      raw = azureRaw;
      const content = azureRaw.content?.slice(0, 4000) ?? "";
      const enhanced = await enhanceGeneralExtraction({
        documentType: "bank_statement",
        layoutText: content,
      });
      extracted = enhanced.extracted;
      llmTokensIn = enhanced.tokensIn;
      llmTokensOut = enhanced.tokensOut;
      confidenceScore = enhanced.extracted.confidenceScore;
      break;
    }
    case "layout-llm": {
      const layout = await analyzeLayoutDocument(params.buffer);
      raw = layout.raw;
      const enhanced = await enhanceGeneralExtraction({
        documentType: classification.documentType,
        layoutText: layout.raw.content ?? layout.extracted.summary ?? "",
      });
      extracted = enhanced.extracted;
      llmTokensIn = enhanced.tokensIn;
      llmTokensOut = enhanced.tokensOut;
      confidenceScore = enhanced.extracted.confidenceScore;
      break;
    }
    default:
      throw new Error("Unsupported pipeline");
  }

  const estimatedCogsAud = estimateCogsAud(
    pipeline.id,
    pageCount,
    pipeline.useLlm
  );

  return {
    documentType: classification.documentType,
    classification,
    pipeline,
    pageCount,
    creditsCharged,
    estimatedCogsAud,
    extracted,
    raw,
    confidenceScore,
    llmTokensIn,
    llmTokensOut,
  };
}
