import "server-only";

import crypto from "crypto";

type TokenScope = "widget" | "admin";

interface TokenPayload {
  storeId: string;
  visitorId?: string;
  adminEmail?: string;
  scope: TokenScope;
  exp: number;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(input: string): string {
  const secret = process.env.APP_SIGNING_SECRET || "";
  return crypto.createHmac("sha256", secret).update(input).digest("base64url");
}

export function issueStoreToken(input: {
  storeId: string;
  visitorId?: string;
  adminEmail?: string;
  scope: TokenScope;
  expiresInSeconds?: number;
}): string {
  const ttl = input.expiresInSeconds ?? 60 * 60;
  const payload: TokenPayload = {
    storeId: input.storeId,
    visitorId: input.visitorId,
    adminEmail: input.adminEmail,
    scope: input.scope,
    exp: Math.floor(Date.now() / 1000) + ttl
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "SAT" }));
  const body = `${encodedHeader}.${encodedPayload}`;
  return `${body}.${sign(body)}`;
}

export function verifyStoreToken(token: string): { valid: boolean; payload?: TokenPayload; reason?: string } {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return { valid: false, reason: "malformed_token" };
  }

  const body = `${header}.${payload}`;
  const expected = sign(body);

  const safeSig = Buffer.from(signature, "utf8");
  const safeExpected = Buffer.from(expected, "utf8");
  if (safeSig.length !== safeExpected.length || !crypto.timingSafeEqual(safeSig, safeExpected)) {
    return { valid: false, reason: "invalid_signature" };
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as TokenPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: "expired_token" };
    }

    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, reason: "invalid_payload" };
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
