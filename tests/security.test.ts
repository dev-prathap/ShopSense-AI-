import { describe, expect, it } from "vitest";
import { issueStoreToken, verifyStoreToken } from "../src/lib/security/store-token";
import { consumeRateLimit } from "../src/lib/security/rate-limit";
import { reserveIdempotencyKey } from "../src/lib/security/idempotency";

describe("store token", () => {
  it("issues and verifies token", () => {
    process.env.APP_SIGNING_SECRET = "test-secret";
    const token = issueStoreToken({ storeId: "s1", visitorId: "v1", scope: "widget", expiresInSeconds: 60 });
    const out = verifyStoreToken(token);

    expect(out.valid).toBe(true);
    expect(out.payload?.storeId).toBe("s1");
    expect(out.payload?.scope).toBe("widget");
  });

  it("rejects wrong scope for admin session", () => {
    process.env.APP_SIGNING_SECRET = "test-secret";
    const widgetToken = issueStoreToken({ storeId: "s1", scope: "widget", expiresInSeconds: 60 });
    const out = verifyStoreToken(widgetToken);
    expect(out.payload?.scope).toBe("widget");
  });
});

describe("rate limiting", () => {
  it("blocks after configured limit", async () => {
    const key = `k-${Date.now()}`;
    const first = await consumeRateLimit({ key, limit: 1, windowMs: 1000 });
    const second = await consumeRateLimit({ key, limit: 1, windowMs: 1000 });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });
});

describe("idempotency", () => {
  it("rejects duplicate key", async () => {
    const first = await reserveIdempotencyKey("n1", "k1");
    const second = await reserveIdempotencyKey("n1", "k1");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
  });
});
