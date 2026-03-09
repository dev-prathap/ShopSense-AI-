import "server-only";

import { NextRequest } from "next/server";
import { extractBearerToken, verifyStoreToken } from "@/lib/security/store-token";

export function verifyWidgetAccess(req: NextRequest, input: { storeId: string; visitorId?: string }) {
  const auth = extractBearerToken(req.headers.get("authorization"));
  const token = auth || req.headers.get("x-store-token");

  if (!token) {
    return { ok: false, reason: "missing_store_token" };
  }

  const verification = verifyStoreToken(token);
  if (!verification.valid || !verification.payload) {
    return { ok: false, reason: verification.reason || "invalid_store_token" };
  }

  if (verification.payload.scope !== "widget") {
    return { ok: false, reason: "invalid_scope" };
  }

  if (verification.payload.storeId !== input.storeId) {
    return { ok: false, reason: "store_mismatch" };
  }

  if (input.visitorId && verification.payload.visitorId && verification.payload.visitorId !== input.visitorId) {
    return { ok: false, reason: "visitor_mismatch" };
  }

  return { ok: true };
}
