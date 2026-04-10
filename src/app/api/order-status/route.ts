import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyWidgetAccess } from "@/lib/security/guards";
import { fetchShopifyOrderStatusByNumber } from "@/lib/shopify/client";

const querySchema = z.object({
  storeId: z.string().min(1),
  orderNumber: z.string().min(1),
  email: z.string().email()
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, orderNumber, email } = parsed.data;
  const auth = verifyWidgetAccess(req, { storeId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const ORDER_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

  const cached = await prisma.orderCache.findFirst({
    where: {
      storeId,
      orderNumber,
      customerEmail: email
    }
  });

  const isStale = cached?.lastSyncedAt && (Date.now() - cached.lastSyncedAt.getTime() > ORDER_CACHE_TTL_MS);

  if (!cached || isStale) {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const live = await fetchShopifyOrderStatusByNumber({
      shopDomain: store.shopDomain,
      accessToken: store.accessToken,
      orderNumber
    }).catch(() => null);

    if (!live || !live.email || live.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tracking = live.fulfillments?.edges?.[0]?.node?.trackingInfo?.[0] || null;
    const orderNumberOnly = live.name.replace(/^#/, "");

    const saved = await prisma.orderCache.upsert({
      where: {
        storeId_shopifyOrderId: {
          storeId,
          shopifyOrderId: live.id
        }
      },
      update: {
        orderNumber: orderNumberOnly,
        customerEmail: live.email,
        financialStatus: live.displayFinancialStatus || null,
        fulfillmentStatus: live.displayFulfillmentStatus || null,
        trackingNumber: tracking?.number || null,
        trackingUrl: tracking?.url || null,
        lastSyncedAt: new Date()
      },
      create: {
        storeId,
        shopifyOrderId: live.id,
        orderNumber: orderNumberOnly,
        customerEmail: live.email,
        financialStatus: live.displayFinancialStatus || null,
        fulfillmentStatus: live.displayFulfillmentStatus || null,
        trackingNumber: tracking?.number || null,
        trackingUrl: tracking?.url || null
      }
    });

    return NextResponse.json({
      orderNumber: saved.orderNumber,
      fulfillmentStatus: saved.fulfillmentStatus,
      financialStatus: saved.financialStatus,
      trackingNumber: saved.trackingNumber,
      trackingUrl: saved.trackingUrl,
      estimatedDeliveryAt: saved.estimatedDeliveryAt
    });
  }

  return NextResponse.json({
    orderNumber: cached.orderNumber,
    fulfillmentStatus: cached.fulfillmentStatus,
    financialStatus: cached.financialStatus,
    trackingNumber: cached.trackingNumber,
    trackingUrl: cached.trackingUrl,
    estimatedDeliveryAt: cached.estimatedDeliveryAt
  });
}
