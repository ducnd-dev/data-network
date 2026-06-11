import { describe, expect, it } from "vitest";
import {
  creditMultiplierForPipeline,
  creditsForDocument,
  planQuota,
  revenuePerCreditAud,
} from "./unit-economics";

describe("unit-economics", () => {
  it("charges 1 credit for invoice pipeline per page", () => {
    expect(creditMultiplierForPipeline("azure-invoice")).toBe(1);
    expect(creditsForDocument("azure-invoice", 3)).toBe(3);
  });

  it("charges 2 credits for layout-llm per page", () => {
    expect(creditMultiplierForPipeline("layout-llm")).toBe(2);
    expect(creditsForDocument("layout-llm", 2)).toBe(4);
  });

  it("business plan has reduced quota for margin", () => {
    expect(planQuota("business")).toBe(3000);
  });

  it("pro revenue per credit is above azure cost", () => {
    expect(revenuePerCreditAud("pro")).toBeGreaterThan(0.04);
  });
});
