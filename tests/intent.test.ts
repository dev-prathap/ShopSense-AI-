import { describe, expect, it } from "vitest";
import { adjustConfidenceBySensitivity, classifyIntent, shouldHandoff } from "../src/lib/ai/intent";

describe("intent classification", () => {
  it("classifies order tracking", () => {
    const out = classifyIntent("Where is my order #1234?");
    expect(out.intent).toBe("order_tracking");
    expect(out.confidence).toBeGreaterThan(0.8);
  });

  it("classifies product discovery", () => {
    const out = classifyIntent("Show me black running shoes under $100");
    expect(out.intent).toBe("product_discovery");
  });
});

describe("handoff policy", () => {
  it("forces handoff for billing/refund", () => {
    const handoff = shouldHandoff("billing_or_refund", 0.9, 0);
    expect(handoff.required).toBe(true);
  });

  it("forces handoff for repeated failures", () => {
    const handoff = shouldHandoff("unknown", 0.6, 2);
    expect(handoff.required).toBe(true);
    expect(handoff.reason).toBe("repeated_failure");
  });
});

describe("confidence sensitivity", () => {
  it("reduces confidence when sensitivity is high", () => {
    const adjusted = adjustConfidenceBySensitivity(0.8, 90);
    expect(adjusted).toBeLessThan(0.8);
  });

  it("increases confidence when sensitivity is low", () => {
    const adjusted = adjustConfidenceBySensitivity(0.8, 10);
    expect(adjusted).toBeGreaterThan(0.8);
  });
});
