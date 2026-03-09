import { describe, expect, it } from "vitest";
import { computeBackoffSeconds } from "../src/lib/jobs/queue";

describe("retry backoff", () => {
  it("grows exponentially and caps at 900 seconds", () => {
    expect(computeBackoffSeconds(0)).toBe(30);
    expect(computeBackoffSeconds(1)).toBe(60);
    expect(computeBackoffSeconds(2)).toBe(120);
    expect(computeBackoffSeconds(10)).toBe(900);
  });
});
