import { creditMultiplierForPipeline } from "@/lib/billing/unit-economics";
import type { DocumentType, PipelineConfig, PipelineId } from "./types";

function pipelineConfig(
  id: PipelineId,
  azureModel: string,
  useLlm: boolean,
  allowedOnFree: boolean
): PipelineConfig {
  return {
    id,
    azureModel,
    useLlm,
    creditMultiplier: creditMultiplierForPipeline(id),
    allowedOnFree,
  };
}

export function resolvePipeline(
  documentType: DocumentType,
  plan: string
): PipelineConfig {
  const isFree = plan === "free";

  switch (documentType) {
    case "invoice":
      return pipelineConfig("azure-invoice", "prebuilt-invoice", false, true);
    case "receipt":
      return pipelineConfig("azure-receipt", "prebuilt-receipt", false, true);
    case "bank_statement":
      return pipelineConfig("layout-llm", "prebuilt-layout", true, false);
    case "purchase_order":
    case "general":
    case "unknown":
      return pipelineConfig("layout-llm", "prebuilt-layout", true, false);
    default:
      return pipelineConfig("layout-llm", "prebuilt-layout", true, false);
  }
}

export function pipelineBlockedMessage(
  pipeline: PipelineConfig,
  plan: string,
  creditsNeeded: number,
  creditsRemaining: number
): string | null {
  if (plan === "free" && !pipeline.allowedOnFree) {
    return "Free plan supports invoice and receipt only. Upgrade to Pro for other document types.";
  }
  if (creditsRemaining < creditsNeeded) {
    return `This document needs ${creditsNeeded} page credit${creditsNeeded === 1 ? "" : "s"}, but you have ${creditsRemaining} remaining this month.`;
  }
  return null;
}
