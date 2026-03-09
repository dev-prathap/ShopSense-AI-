import crypto from "crypto";

export function verifyShopifyHmac(message: string, hmac: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(message).digest("base64");
  const safeHmac = Buffer.from(hmac || "", "utf8");
  const safeDigest = Buffer.from(digest, "utf8");

  if (safeHmac.length !== safeDigest.length) {
    return false;
  }

  return crypto.timingSafeEqual(safeHmac, safeDigest);
}

export function verifyShopifyQueryHmac(message: string, hmac: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(message).digest("hex");
  const safeHmac = Buffer.from(hmac || "", "utf8");
  const safeDigest = Buffer.from(digest, "utf8");

  if (safeHmac.length !== safeDigest.length) {
    return false;
  }

  return crypto.timingSafeEqual(safeHmac, safeDigest);
}

export function signAppPayload(payload: string): string {
  const secret = process.env.APP_SIGNING_SECRET || "";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
