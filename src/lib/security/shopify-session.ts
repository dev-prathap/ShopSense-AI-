import "server-only";

import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { extractBearerToken } from "@/lib/security/store-token";

export interface ShopifySessionClaims {
  aud: string | string[];
  dest: string;
  exp: number;
  nbf?: number;
  iss?: string;
  sub?: string;
  email?: string;
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function verifyHmacSha256(input: string, signature: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(input).digest("base64url");
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(digest, "utf8");
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function parseAudience(aud: string | string[]): string[] {
  return Array.isArray(aud) ? aud : [aud];
}

export function verifyShopifySessionToken(token: string): { valid: boolean; claims?: ShopifySessionClaims; reason?: string } {
  const [headerPart, payloadPart, signature] = token.split(".");
  if (!headerPart || !payloadPart || !signature) {
    return { valid: false, reason: "malformed_shopify_session_token" };
  }

  const secret = process.env.SHOPIFY_API_SECRET || "";
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!secret || !apiKey) {
    return { valid: false, reason: "shopify_env_missing" };
  }

  let header: { alg?: string };
  let claims: ShopifySessionClaims;
  try {
    header = JSON.parse(decodeBase64Url(headerPart));
    claims = JSON.parse(decodeBase64Url(payloadPart));
  } catch {
    return { valid: false, reason: "invalid_jwt_payload" };
  }

  if (header.alg !== "HS256") {
    return { valid: false, reason: "unsupported_alg" };
  }

  const body = `${headerPart}.${payloadPart}`;
  if (!verifyHmacSha256(body, signature, secret)) {
    return { valid: false, reason: "invalid_signature" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp <= now) {
    return { valid: false, reason: "expired_token" };
  }

  if (claims.nbf && claims.nbf > now + 30) {
    return { valid: false, reason: "token_not_yet_valid" };
  }

  const audiences = parseAudience(claims.aud || "");
  if (!audiences.includes(apiKey)) {
    return { valid: false, reason: "invalid_audience" };
  }

  return { valid: true, claims };
}

export function extractShopDomainFromDest(dest: string): string | null {
  try {
    const url = new URL(dest);
    if (!url.hostname.endsWith(".myshopify.com")) {
      return null;
    }

    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function verifyShopifyAdminRequest(req: NextRequest, expectedStoreId: string) {
  const bearer = extractBearerToken(req.headers.get("authorization"));
  if (!bearer) {
    return { ok: false as const, reason: "missing_shopify_session_token" };
  }

  const verified = verifyShopifySessionToken(bearer);
  if (!verified.valid || !verified.claims) {
    return { ok: false as const, reason: verified.reason || "invalid_shopify_session_token" };
  }

  const shopDomain = extractShopDomainFromDest(verified.claims.dest);
  if (!shopDomain) {
    return { ok: false as const, reason: "invalid_dest_claim" };
  }

  const store = await prisma.store.findUnique({ where: { shopDomain } });
  if (!store) {
    return { ok: false as const, reason: "store_not_found" };
  }

  if (store.id !== expectedStoreId) {
    return { ok: false as const, reason: "store_mismatch" };
  }

  return {
    ok: true as const,
    storeId: store.id,
    shopDomain,
    claims: verified.claims
  };
}
