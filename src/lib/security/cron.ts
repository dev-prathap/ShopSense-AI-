import "server-only";

import { NextRequest } from "next/server";

export function isValidCronRequest(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return false;
  }

  const auth = req.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");

  if (scheme?.toLowerCase() === "bearer" && token === expected) {
    return true;
  }

  const headerSecret = req.headers.get("x-cron-secret");
  return headerSecret === expected;
}
