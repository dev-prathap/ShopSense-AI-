import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { isValidCronRequest } from "../src/lib/security/cron";

describe("cron auth", () => {
  it("accepts bearer token", () => {
    process.env.CRON_SECRET = "cron-secret";
    const req = new NextRequest("http://localhost/api/cron/retry-jobs", {
      headers: {
        authorization: "Bearer cron-secret"
      }
    });

    expect(isValidCronRequest(req)).toBe(true);
  });

  it("rejects invalid token", () => {
    process.env.CRON_SECRET = "cron-secret";
    const req = new NextRequest("http://localhost/api/cron/retry-jobs", {
      headers: {
        authorization: "Bearer wrong"
      }
    });

    expect(isValidCronRequest(req)).toBe(false);
  });
});
