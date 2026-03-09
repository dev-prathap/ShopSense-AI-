import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { verifyShopifyHmac } from "@/lib/security/hmac";
import { syncCatalog } from "@/lib/shopify/sync";
import { enqueueRetryJob } from "@/lib/jobs/queue";
import { applyInventoryDelta } from "@/lib/shopify/inventory";

export async function POST(req: NextRequest) {
  const topic = req.headers.get("x-shopify-topic") || "";
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const eventIdHeader = req.headers.get("x-shopify-event-id");
  const body = await req.text();

  const secret = process.env.SHOPIFY_API_SECRET || "";
  if (!verifyShopifyHmac(body, hmac, secret)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({ where: { shopDomain } });
  if (!store) {
    return NextResponse.json({ ok: true });
  }

  const eventKey = eventIdHeader || crypto.createHash("sha256").update(`${topic}:${body}`).digest("hex");
  try {
    await prisma.webhookEvent.create({
      data: {
        storeId: store.id,
        eventKey,
        topic
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    throw error;
  }

  if (topic === "app/uninstalled") {
    await prisma.store.update({
      where: { id: store.id },
      data: { uninstalledAt: new Date() }
    });
  }

  if (topic === "app_subscriptions/update") {
    const payload = JSON.parse(body) as {
      id?: number | string;
      admin_graphql_api_id?: string;
      name?: string;
      status?: string;
      trial_ends_on?: string | null;
      current_period_end?: string | null;
      cancelled_on?: string | null;
    };

    const rawTier = (payload.name || "STARTER").toUpperCase();
    const tier: SubscriptionTier = rawTier.includes("PRO") ? "PRO" : rawTier.includes("GROWTH") ? "GROWTH" : "STARTER";
    const status = (payload.status || "").toLowerCase();
    const active = status === "active" || status === "accepted";
    const externalChargeId = payload.admin_graphql_api_id || (payload.id ? String(payload.id) : null);

    const trialEndsAt = payload.trial_ends_on
      ? new Date(payload.trial_ends_on)
      : payload.current_period_end
        ? new Date(payload.current_period_end)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.billingSubscription.upsert({
      where: { storeId: store.id },
      update: {
        tier,
        active,
        externalChargeId
      },
      create: {
        storeId: store.id,
        tier,
        active,
        externalChargeId,
        trialEndsAt
      }
    });
  }

  if (topic === "inventory_levels/update") {
    const payload = JSON.parse(body) as { inventory_item_id?: number | string; available?: number };
    if (payload.inventory_item_id !== undefined && payload.available !== undefined) {
      const delta = await applyInventoryDelta({
        storeId: store.id,
        inventoryItemId: String(payload.inventory_item_id),
        available: Number(payload.available)
      });

      if (delta.updatedVariants === 0) {
        try {
          await syncCatalog(store.id);
        } catch (error) {
          await enqueueRetryJob({
            storeId: store.id,
            type: "SYNC_CATALOG",
            payload: { source: "webhook", topic },
            errorMessage: error instanceof Error ? error.message : "sync_catalog_failed"
          });
        }
      }
    }
  }

  if (topic === "products/update" || topic === "products/create") {
    try {
      await syncCatalog(store.id);
    } catch (error) {
      await enqueueRetryJob({
        storeId: store.id,
        type: "SYNC_CATALOG",
        payload: { source: "webhook", topic },
        errorMessage: error instanceof Error ? error.message : "sync_catalog_failed"
      });
    }
  }

  if (topic === "orders/updated" || topic === "orders/create") {
    const payload = JSON.parse(body) as {
      id: number;
      order_number: number;
      email?: string;
      customer?: {
        id?: number | string;
        email?: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
      };
      financial_status?: string;
      fulfillment_status?: string;
      tracking_number?: string;
      tracking_url?: string;
    };

    await prisma.orderCache.upsert({
      where: {
        storeId_shopifyOrderId: {
          storeId: store.id,
          shopifyOrderId: String(payload.id)
        }
      },
      update: {
        orderNumber: String(payload.order_number),
        customerEmail: payload.email || null,
        financialStatus: payload.financial_status || null,
        fulfillmentStatus: payload.fulfillment_status || null,
        trackingNumber: payload.tracking_number || null,
        trackingUrl: payload.tracking_url || null,
        lastSyncedAt: new Date()
      },
      create: {
        storeId: store.id,
        shopifyOrderId: String(payload.id),
        orderNumber: String(payload.order_number),
        customerEmail: payload.email || null,
        financialStatus: payload.financial_status || null,
        fulfillmentStatus: payload.fulfillment_status || null,
        trackingNumber: payload.tracking_number || null,
        trackingUrl: payload.tracking_url || null
      }
    });

    if (payload.customer?.id !== undefined) {
      await prisma.customerCache.upsert({
        where: {
          storeId_shopifyCustomerId: {
            storeId: store.id,
            shopifyCustomerId: String(payload.customer.id)
          }
        },
        update: {
          email: payload.customer.email || payload.email || null,
          firstName: payload.customer.first_name || null,
          lastName: payload.customer.last_name || null,
          phone: payload.customer.phone || null
        },
        create: {
          storeId: store.id,
          shopifyCustomerId: String(payload.customer.id),
          email: payload.customer.email || payload.email || null,
          firstName: payload.customer.first_name || null,
          lastName: payload.customer.last_name || null,
          phone: payload.customer.phone || null
        }
      });
    }
  }

  if (topic === "customers/create" || topic === "customers/update") {
    const payload = JSON.parse(body) as {
      id?: number | string;
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };

    if (payload.id !== undefined) {
      await prisma.customerCache.upsert({
        where: {
          storeId_shopifyCustomerId: {
            storeId: store.id,
            shopifyCustomerId: String(payload.id)
          }
        },
        update: {
          email: payload.email || null,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          phone: payload.phone || null
        },
        create: {
          storeId: store.id,
          shopifyCustomerId: String(payload.id),
          email: payload.email || null,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          phone: payload.phone || null
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}
