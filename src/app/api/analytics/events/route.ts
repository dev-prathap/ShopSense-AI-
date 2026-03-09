import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAnalyticsSnapshot } from "@/lib/analytics/service";
import { verifyWidgetAccess } from "@/lib/security/guards";
import { reserveIdempotencyKey } from "@/lib/security/idempotency";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const eventSchema = z.object({
  storeId: z.string().min(1),
  conversationId: z.string().optional(),
  eventType: z.enum(["session_start", "widget_open", "message_sent", "product_click", "conversion", "recovery_accept"]),
  productId: z.string().optional(),
  offerCode: z.string().optional(),
  revenue: z.number().optional()
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const parsed = eventSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, conversationId, eventType, productId, offerCode, revenue } = parsed.data;
  const auth = verifyWidgetAccess(req, { storeId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const limiter = await consumeRateLimit({
    key: `analytics:${storeId}:${ip}`,
    limit: 80,
    windowMs: 60_000
  });
  if (!limiter.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (eventType === "conversion" || eventType === "recovery_accept") {
    const idempotency = await reserveIdempotencyKey(
      `analytics:${storeId}:${eventType}:${conversationId || "unknown"}`,
      req.headers.get("idempotency-key")
    );
    if (!idempotency.ok) {
      return NextResponse.json({ error: idempotency.reason }, { status: 409 });
    }
  }

  if (eventType === "conversion" && conversationId) {
    await prisma.conversation.updateMany({
      where: { id: conversationId, storeId },
      data: {
        convertedAt: new Date()
      }
    });

    if (productId) {
      await prisma.recommendationEvent.updateMany({
        where: {
          storeId,
          conversationId,
          productId
        },
        data: {
          convertedAt: new Date(),
          attributedRevenue: revenue || 0
        }
      });
    }

    await prisma.recoveryOffer.updateMany({
      where: {
        storeId,
        conversationId,
        ...(offerCode ? { offerCode } : {}),
        acceptedAt: {
          not: null
        },
        convertedAt: null
      },
      data: {
        convertedAt: new Date()
      }
    });
  }

  if (eventType === "product_click" && conversationId && productId) {
    await prisma.recommendationEvent.updateMany({
      where: {
        storeId,
        conversationId,
        productId
      },
      data: {
        clickedAt: new Date()
      }
    });
  }

  if (eventType === "recovery_accept" && conversationId) {
    await prisma.recoveryOffer.updateMany({
      where: {
        storeId,
        conversationId,
        ...(offerCode ? { offerCode } : {}),
        acceptedAt: null
      },
      data: {
        acceptedAt: new Date()
      }
    });
  }

  const snapshot = await getAnalyticsSnapshot(storeId);
  return NextResponse.json({ ok: true, snapshot });
}
