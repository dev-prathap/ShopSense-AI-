import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { extractShopDomainFromDest, verifyShopifySessionToken } from "../src/lib/security/shopify-session";

function b64(data: object): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

function sign(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

function makeToken(payload: Record<string, unknown>, secret: string): string {
  const header = b64({ alg: "HS256", typ: "JWT" });
  const claims = b64(payload);
  const body = `${header}.${claims}`;
  return `${body}.${sign(body, secret)}`;
}

describe("shopify session token", () => {
  it("verifies valid token", () => {
    process.env.SHOPIFY_API_SECRET = "shopify-secret";
    process.env.SHOPIFY_API_KEY = "shopify-key";

    const token = makeToken(
      {
        aud: "shopify-key",
        dest: "https://demo-store.myshopify.com",
        exp: Math.floor(Date.now() / 1000) + 300,
        nbf: Math.floor(Date.now() / 1000) - 10,
        sub: "gid://shopify/User/1",
        email: "owner@example.com"
      },
      "shopify-secret"
    );

    const out = verifyShopifySessionToken(token);
    expect(out.valid).toBe(true);
    expect(out.claims?.dest).toBe("https://demo-store.myshopify.com");
  });

  it("rejects wrong audience", () => {
    process.env.SHOPIFY_API_SECRET = "shopify-secret";
    process.env.SHOPIFY_API_KEY = "shopify-key";

    const token = makeToken(
      {
        aud: "other-key",
        dest: "https://demo-store.myshopify.com",
        exp: Math.floor(Date.now() / 1000) + 300
      },
      "shopify-secret"
    );

    const out = verifyShopifySessionToken(token);
    expect(out.valid).toBe(false);
    expect(out.reason).toBe("invalid_audience");
  });

  it("extracts valid myshopify domain", () => {
    expect(extractShopDomainFromDest("https://test-shop.myshopify.com/admin")).toBe("test-shop.myshopify.com");
    expect(extractShopDomainFromDest("https://evil.com")).toBeNull();
  });
});
