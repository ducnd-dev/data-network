import type { OrgPlan } from "@/lib/billing/plans";
import type { PipelineId } from "@/lib/ocr/types";

const AZURE_PAGE_COST_AUD = Number(process.env.OCR_AZURE_PAGE_COST_AUD ?? "0.015");
const LLM_CLASSIFY_COST_AUD = Number(process.env.OCR_LLM_CLASSIFY_COST_AUD ?? "0.002");
const LLM_EXTRACT_COST_AUD = Number(process.env.OCR_LLM_EXTRACT_COST_AUD ?? "0.003");
const PIPELINE_MULTIPLIERS: Record<PipelineId, number> = {
  "azure-invoice": Number(process.env.OCR_CREDIT_MULTIPLIER_INVOICE ?? "1"),
  "azure-receipt": Number(process.env.OCR_CREDIT_MULTIPLIER_RECEIPT ?? "1"),
  "azure-bank-statement": Number(process.env.OCR_CREDIT_MULTIPLIER_BANK ?? "2"),
  "layout-llm": Number(process.env.OCR_CREDIT_MULTIPLIER_GENERAL ?? "2"),
};

const PLAN_PRICE_AUD: Record<OrgPlan, number> = {
  free: 0,
  pro: 29,
  business: 99,
};

const PLAN_QUOTA: Record<OrgPlan, number> = {
  free: 20,
  pro: 500,
  business: 3000,
};

export function planQuota(plan: string | null | undefined): number {
  if (plan === "business") return PLAN_QUOTA.business;
  if (plan === "pro") return PLAN_QUOTA.pro;
  return PLAN_QUOTA.free;
}

export function revenuePerCreditAud(plan: string | null | undefined): number {
  const key = (plan === "pro" || plan === "business" ? plan : "free") as OrgPlan;
  if (key === "free") return 0;
  return PLAN_PRICE_AUD[key] / PLAN_QUOTA[key];
}

export function estimateCogsAud(
  pipelineId: PipelineId,
  pages: number,
  usedLlm = false
): number {
  const classify = LLM_CLASSIFY_COST_AUD;
  const azure = pages * AZURE_PAGE_COST_AUD;
  const llm = usedLlm ? LLM_EXTRACT_COST_AUD : 0;
  return classify + azure + llm;
}

export function creditMultiplierForPipeline(pipelineId: PipelineId): number {
  return PIPELINE_MULTIPLIERS[pipelineId] ?? 2;
}

export function creditsForDocument(
  pipelineId: PipelineId,
  pageCount: number
): number {
  return pageCount * creditMultiplierForPipeline(pipelineId);
}

export function isProfitableForPlan(
  pipelineId: PipelineId,
  plan: string | null | undefined,
  pageCount = 1
): boolean {
  if (plan === "free") return true;
  const credits = creditsForDocument(pipelineId, pageCount);
  const revenue = credits * revenuePerCreditAud(plan);
  const cogs = estimateCogsAud(pipelineId, pageCount, pipelineId === "layout-llm");
  return revenue >= cogs * 1.33;
}

export function documentTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "invoice":
      return "Invoice";
    case "receipt":
      return "Receipt";
    case "purchase_order":
      return "Purchase order";
    case "bank_statement":
      return "Bank statement";
    case "general":
      return "General";
    case "unknown":
      return "Unknown";
    default:
      return "Document";
  }
}
