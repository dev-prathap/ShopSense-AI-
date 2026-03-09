import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleChat } from "@/lib/ai/service";
import { verifyWidgetAccess } from "@/lib/security/guards";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { assertStoreSubscriptionActive } from "@/lib/billing/guard";
import { triggerHandoffNotification } from "@/lib/handoff/service";

const schema = z.object({
  storeId: z.string().min(1),
  visitorId: z.string().min(1),
  conversationId: z.string().optional(),
  message: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, visitorId, message } = parsed.data;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const auth = verifyWidgetAccess(req, { storeId, visitorId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const billing = await assertStoreSubscriptionActive(storeId);
  if (!billing.ok) {
    return NextResponse.json({ error: billing.reason }, { status: 402 });
  }

  const limiter = await consumeRateLimit({
    key: `chat:${storeId}:${visitorId}:${ip}`,
    limit: 20,
    windowMs: 60_000
  });
  if (!limiter.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const conversation =
    parsed.data.conversationId
      ? await prisma.conversation.findFirst({
          where: {
            id: parsed.data.conversationId,
            storeId,
            visitorId
          }
        })
      : await prisma.conversation.create({
          data: {
            storeId,
            visitorId
          }
        });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message
    }
  });

  const output = await handleChat({
    storeId,
    visitorId,
    conversationId: conversation.id,
    message
  });

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: output.reply,
        intent: output.intent,
        confidence: output.confidence
      }
    }),
    ...output.products.map((product, index) =>
      prisma.recommendationEvent.create({
        data: {
          storeId,
          conversationId: conversation.id,
          productId: product.id,
          position: index + 1,
          reason: product.reason || "Recommended based on your query"
        }
      })
    ),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: output.handoff.required
        ? {
            status: "HANDOFF_REQUESTED",
            handoffReason: output.handoff.reason || "Automatic handoff"
          }
        : {}
    })
  ]);

  if (output.handoff.required && conversation.status !== "HANDOFF_REQUESTED") {
    await triggerHandoffNotification({
      storeId,
      conversationId: conversation.id,
      visitorId,
      reason: output.handoff.reason,
      latestUserMessage: message
    });
  }

  return NextResponse.json({
    conversationId: conversation.id,
    ...output
  });
}
