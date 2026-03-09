import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { issueStoreToken } from "@/lib/security/store-token";
import { assertStoreSubscriptionActive } from "@/lib/billing/guard";

const schema = z.object({
  storeId: z.string().min(1),
  visitorId: z.string().min(1),
  sessionId: z.string().optional()
});

function isAllowedOrigin(input: { origin: string | null; shopDomain: string }) {
  if (!input.origin) return true;
  try {
    const url = new URL(input.origin);
    const host = url.hostname.toLowerCase();
    
    // Core allowed origins
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host === input.shopDomain.toLowerCase()) return true;
    if (host.endsWith(".myshopify.com")) return true;
    
    // Allow the app's own deployment (for demo/dashboard)
    const appUrl = process.env.SHOPIFY_APP_URL;
    if (appUrl) {
      const appHost = new URL(appUrl).hostname.toLowerCase();
      if (host === appHost) return true;
    }
    
    // Vercel preview/deployment domains
    if (host.endsWith(".vercel.app")) return true;

    return false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, visitorId } = parsed.data;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const limiter = await consumeRateLimit({
    key: `widget-session:${storeId}:${ip}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, shopDomain: true }
  });
  if (!store) {
    return NextResponse.json({ error: "store_not_found" }, { status: 404 });
  }

  const origin = req.headers.get("origin");
  if (!isAllowedOrigin({ origin, shopDomain: store.shopDomain })) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 });
  }

  const billing = await assertStoreSubscriptionActive(storeId);
  if (!billing.ok) {
    return NextResponse.json({ error: billing.reason }, { status: 402 });
  }

  const expiresInSeconds = 60 * 20;
  const token = issueStoreToken({
    storeId,
    visitorId,
    scope: "widget",
    expiresInSeconds
  });

  return NextResponse.json({
    token,
    expiresInSeconds,
    visitorId
  });
}
