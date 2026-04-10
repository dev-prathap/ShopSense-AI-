import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Conversation } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { handleChat } from "@/lib/ai/service";
import { verifyWidgetAccess } from "@/lib/security/guards";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { assertStoreSubscriptionActive } from "@/lib/billing/guard";
import { triggerHandoffNotification } from "@/lib/handoff/service";
import { checkUsageLimits } from "@/lib/billing/usage-tracking";

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

  // Check message usage limits
  const withinLimits = await checkUsageLimits(storeId);
  if (!withinLimits) {
    return NextResponse.json(
      { error: "Monthly message limit exceeded. Please upgrade your plan." },
      { status: 402 }
    );
  }

  // Handle conversation creation/lookup with race condition protection
  let conversation: Conversation | null;
  if (parsed.data.conversationId) {
    // Find existing conversation by ID
    conversation = await prisma.conversation.findFirst({
      where: {
        id: parsed.data.conversationId,
        storeId,
        visitorId
      }
    });
  } else {
    // For new conversations, first try to find an existing one to prevent duplicates
    conversation = await prisma.conversation.findFirst({
      where: { storeId, visitorId }
    });

    if (!conversation) {
      // Only create if one doesn't exist
      try {
        conversation = await prisma.conversation.create({
          data: {
            storeId,
            visitorId
          }
        });
      } catch (error: any) {
        // If creation fails (possibly due to race condition), try to find existing again
        if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
          conversation = await prisma.conversation.findFirst({
            where: { storeId, visitorId }
          });
        }

        if (!conversation) {
          throw error; // Re-throw if it's not a race condition issue
        }
      }
    }
  }

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Process AI chat before database transaction to avoid long-running transactions
  const output = await handleChat({
    storeId,
    visitorId,
    conversationId: conversation.id,
    message
  });

  // All database operations in a single transaction for data integrity
  const [userMessage, assistantMessage] = await prisma.$transaction([
    // Create user message
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message
      }
    }),
    // Create assistant message
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
