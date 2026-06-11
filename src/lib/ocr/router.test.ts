import { describe, expect, it } from "vitest";
import { resolvePipeline } from "./router";

describe("resolvePipeline", () => {
  it("routes invoice to azure-invoice on free plan", () => {
    const pipeline = resolvePipeline("invoice", "free");
    expect(pipeline.id).toBe("azure-invoice");
    expect(pipeline.allowedOnFree).toBe(true);
    expect(pipeline.creditMultiplier).toBe(1);
  });

  it("routes general to layout-llm with 2x credits", () => {
    const pipeline = resolvePipeline("general", "pro");
    expect(pipeline.id).toBe("layout-llm");
    expect(pipeline.useLlm).toBe(true);
    expect(pipeline.creditMultiplier).toBe(2);
    expect(pipeline.allowedOnFree).toBe(false);
  });

  it("blocks general on free via allowedOnFree flag", () => {
    const pipeline = resolvePipeline("unknown", "free");
    expect(pipeline.allowedOnFree).toBe(false);
  });
});
