import { NextRequest, NextResponse } from "next/server";
import { exchangeShopifyAccessToken } from "@/lib/shopify/client";
import { verifyShopifyQueryHmac } from "@/lib/security/hmac";
import { prisma } from "@/lib/db/prisma";
import { ensureTrialSubscription } from "@/lib/billing/service";
import { ensureShopifyWebhooks } from "@/lib/shopify/webhooks";
import { syncCatalog } from "@/lib/shopify/sync";
import { enqueueRetryJob } from "@/lib/jobs/queue";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const code = req.nextUrl.searchParams.get("code");
  const hmac = req.nextUrl.searchParams.get("hmac") || "";
  const state = req.nextUrl.searchParams.get("state");

  const expectedState = req.cookies.get("shopify_oauth_state")?.value;
  const pendingAppUserId = req.cookies.get("asa_pending_app_user_id")?.value;

  if (!shop || !code || !state || state !== expectedState) {
    return NextResponse.json({ error: "Invalid OAuth parameters" }, { status: 400 });
  }

  const sortedParams = new URLSearchParams(req.nextUrl.searchParams);
  sortedParams.delete("hmac");
  const message = [...sortedParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const secret = process.env.SHOPIFY_API_SECRET || "";
  if (!verifyShopifyQueryHmac(message, hmac, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { access_token } = await exchangeShopifyAccessToken(shop, code);
  const associatedEmail = (req.nextUrl.searchParams.get("associated_user_email") || `owner@${shop}`)
    .trim()
    .toLowerCase();
  const associatedUserId = req.nextUrl.searchParams.get("associated_user[id]")?.trim() || null;

  const store = await prisma.store.upsert({
    where: { shopDomain: shop },
    update: {
      accessToken: access_token,
      uninstalledAt: null
    },
    create: {
      shopDomain: shop,
      accessToken: access_token
    }
  });

  await prisma.user.upsert({
    where: {
      storeId_email: {
        storeId: store.id,
        email: associatedEmail
      }
    },
    update: {
      role: UserRole.OWNER,
      shopifyUserId: associatedUserId
    },
    create: {
      storeId: store.id,
      email: associatedEmail,
      role: UserRole.OWNER,
      shopifyUserId: associatedUserId
    }
  });

  if (pendingAppUserId) {
    await prisma.appUserStoreMembership.upsert({
      where: {
        appUserId_storeId: {
          appUserId: pendingAppUserId,
          storeId: store.id
        }
      },
      update: {
        role: "owner"
      },
      create: {
        appUserId: pendingAppUserId,
        storeId: store.id,
        role: "owner"
      }
    });
  }

  // Subscription will be handled during Wizard/Billing step
  // await ensureTrialSubscription(store.id);
  const webhooks = await ensureShopifyWebhooks({
    shopDomain: store.shopDomain,
    accessToken: store.accessToken
  }).catch(async (error) => {
    await enqueueRetryJob({
      storeId: store.id,
      type: "ENSURE_WEBHOOKS",
      payload: { source: "oauth_callback" },
      errorMessage: error instanceof Error ? error.message : "ensure_webhooks_failed"
    });
    return {
      callbackUrl: `${process.env.SHOPIFY_APP_URL}/api/webhooks/shopify`,
      created: [],
      skipped: [],
      errors: [{ topic: "ALL", message: "queued_retry_job" }]
    };
  });

  if (webhooks.errors.length > 0) {
    await enqueueRetryJob({
      storeId: store.id,
      type: "ENSURE_WEBHOOKS",
      payload: { source: "oauth_callback_partial" },
      errorMessage: JSON.stringify(webhooks.errors)
    });
  }

  try {
    await syncCatalog(store.id);
  } catch (error) {
    await enqueueRetryJob({
      storeId: store.id,
      type: "SYNC_CATALOG",
      payload: { source: "oauth_callback" },
      errorMessage: error instanceof Error ? error.message : "sync_catalog_failed"
    });
  }

  // 4. Automate Chatbot Installation via ScriptTag
  const { ensureShopifyScriptTag } = await import("@/lib/shopify/client");
  await ensureShopifyScriptTag(store.shopDomain, store.accessToken, store.id).catch(err => {
    console.error(`[Shopify] Automatic script installation failed for ${store.shopDomain}:`, err);
  });

  const redirect = new URL("/dashboard/wizard", process.env.SHOPIFY_APP_URL);
  redirect.searchParams.set("storeId", store.id);
  if (webhooks.errors.length > 0) {
    redirect.searchParams.set("webhookStatus", "partial_failure");
  }
  const res = NextResponse.redirect(redirect.toString());
  res.cookies.set("asa_pending_app_user_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return res;
}
