import "server-only";

import { prisma } from "@/lib/db/prisma";
import { enqueueRetryJob } from "@/lib/jobs/queue";
import { sendEmail, generateHandoffEmail } from "@/lib/email/service";

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

  // Send email notification if support email is configured
  let emailSent = false;
  if (store.supportEmail) {
    try {
      const appHost = process.env.SHOPIFY_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const dashboardUrl = `${appHost}/dashboard/inbox/${input.conversationId}?storeId=${input.storeId}`;

      const emailContent = generateHandoffEmail({
        storeId: input.storeId,
        shopDomain: store.shopDomain || 'Unknown Store',
        conversationId: input.conversationId,
        visitorId: input.visitorId,
        handoffReason: input.reason || 'Unknown reason',
        latestUserMessage: input.latestUserMessage,
        dashboardUrl
      });

      const emailResult = await sendEmail({
        to: store.supportEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      emailSent = emailResult.sent;
      if (!emailResult.sent) {
        console.error('Failed to send handoff email:', emailResult.error);
      }
    } catch (error) {
      console.error('Error sending handoff email:', error);
    }
  }

  // If no webhook is configured but we sent an email, that's still success
  if (!store.handoffWebhookUrl) {
    if (emailSent) {
      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { handoffNotifiedAt: new Date() }
      });
      return { sent: true, reason: "email_sent" as const };
    }
    return { sent: false, reason: "no_notification_method_configured" as const };
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
