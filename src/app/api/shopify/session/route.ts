import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";
import { verifyShopifySessionToken, extractShopDomainFromDest } from "@/lib/security/shopify-session";
import { signAppSession, setAppSessionCookie } from "@/lib/auth/session";

/**
 * Exchange a Shopify session token for an offline access token via token exchange.
 * This avoids OAuth redirects — works inside Shopify embedded iframes.
 */
async function exchangeTokenForAccessToken(shop: string, sessionToken: string): Promise<string | null> {
  try {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
        subject_token: sessionToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
        requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
      }),
    });

    if (!res.ok) {
      console.error("[shopify/session] Token exchange failed:", res.status, await res.text().catch(() => ""));
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("[shopify/session] Token exchange error:", err);
    return null;
  }
}

/**
 * POST /api/shopify/session
 *
 * Exchanges a Shopify session token (from App Bridge) for an app session cookie.
 * If the store doesn't exist yet, auto-creates it via token exchange.
 */
export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: null }));
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  const result = verifyShopifySessionToken(token);
  if (!result.valid || !result.claims) {
    return NextResponse.json({ error: result.reason }, { status: 401 });
  }

  const shop = extractShopDomainFromDest(result.claims.dest);
  if (!shop) {
    return NextResponse.json({ error: "invalid_dest_claim" }, { status: 401 });
  }

  let store = await prisma.store.findUnique({
    where: { shopDomain: shop }
  });

  // Store not in DB — auto-provision via token exchange (no OAuth redirect needed)
  if (!store || store.uninstalledAt) {
    const accessToken = await exchangeTokenForAccessToken(shop, token);
    if (!accessToken) {
      return NextResponse.json({ error: "token_exchange_failed" }, { status: 401 });
    }

    store = await prisma.store.upsert({
      where: { shopDomain: shop },
      update: { accessToken, uninstalledAt: null },
      create: { shopDomain: shop, accessToken },
    });

    // Kick off background setup (webhooks, catalog sync, script tag)
    const { enqueueRetryJob } = await import("@/lib/jobs/queue");
    await enqueueRetryJob({ storeId: store.id, type: "ENSURE_WEBHOOKS", payload: { source: "token_exchange" } });
    await enqueueRetryJob({ storeId: store.id, type: "SYNC_CATALOG", payload: { source: "token_exchange" } });
    await enqueueRetryJob({ storeId: store.id, type: "INSTALL_SCRIPT_TAG", payload: { source: "token_exchange" } });
  }

  // Find or create user for this Shopify session. Shopify session token claims include
  // `sub` (user id) and `email` for the logged-in merchant user.
  const shopifyUserId = result.claims.sub || null;
  const ownerEmail = result.claims.email || `owner@${shop}`;

  let user = shopifyUserId
    ? await prisma.user.findFirst({ where: { storeId: store.id, shopifyUserId } })
    : null;

  if (!user) {
    user = await prisma.user.findFirst({ where: { storeId: store.id, role: "OWNER" } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        storeId: store.id,
        email: ownerEmail,
        role: UserRole.OWNER,
        shopifyUserId,
      },
    });
  }

  const sessionToken = await signAppSession({
    sub: user.id,
    email: user.email,
    provider: "shopify"
  });

  const res = NextResponse.json({ storeId: store.id, shop: store.shopDomain });
  setAppSessionCookie(res, sessionToken);
  return res;
}
