import "server-only";

import { prisma } from "@/lib/db/prisma";
import { enqueueRetryJob } from "@/lib/jobs/queue";

export async function triggerHandoffNotification(input: {
  storeId: string;
  conversationId: string;
  visitorId: string;
  reason?: string;
  latestUserMessage: string;
}) {
  const store = await prisma.store.findUnique({
    where: { id: input.storeId },
    select: {
      handoffWebhookUrl: true,
      supportEmail: true,
      shopDomain: true
    }
  });

  if (!store) {
    return { sent: false, reason: "store_not_found" as const };
  }

  const payload = {
    type: "handoff_requested",
    storeId: input.storeId,
    shopDomain: store.shopDomain,
    conversationId: input.conversationId,
    visitorId: input.visitorId,
    handoffReason: input.reason || "unknown",
    latestUserMessage: input.latestUserMessage,
    supportEmail: store.supportEmail || null,
    createdAt: new Date().toISOString()
  };

  if (!store.handoffWebhookUrl) {
    return { sent: false, reason: "handoff_webhook_not_configured" as const };
  }

  try {
    const res = await fetch(store.handoffWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`handoff_webhook_http_${res.status}`);
    }

    await prisma.conversation.update({
      where: { id: input.conversationId },
      data: {
        handoffNotifiedAt: new Date()
      }
    });

    return { sent: true as const };
  } catch (error) {
    await enqueueRetryJob({
      storeId: input.storeId,
      type: "HANDOFF_NOTIFY",
      payload: {
        source: "handoff_notification",
        conversationId: input.conversationId,
        handoffWebhookUrl: store.handoffWebhookUrl,
        handoffPayload: payload
      },
      errorMessage: error instanceof Error ? error.message : "handoff_notification_failed"
    });

    return { sent: false as const, reason: "handoff_delivery_failed" as const };
  }
}
