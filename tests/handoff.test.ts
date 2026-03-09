import { describe, expect, it } from "vitest";
import { computeBackoffSeconds } from "../src/lib/jobs/queue";

describe("handoff retry strategy", () => {
  it("uses bounded backoff suitable for notification retries", () => {
    expect(computeBackoffSeconds(1)).toBe(60);
    expect(computeBackoffSeconds(5)).toBeGreaterThan(60);
    expect(computeBackoffSeconds(20)).toBe(900);
  });
});
