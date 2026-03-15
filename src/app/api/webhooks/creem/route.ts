import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyCreemWebhook } from "@/lib/billing/creem";

export async function POST(req: NextRequest) {
  try {
    // Get raw body as text for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature");

    // Verify webhook signature
    const isValidSignature = await verifyCreemWebhook(rawBody, signature || "");
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse body after signature verification
    const body = JSON.parse(rawBody);
    console.log("Received verified Creem webhook", body.type);

    // Event types usually look like: "checkout.succeeded", "payment.succeeded", etc.
    // Based on common billing webhooks:
    // Supported Creem event types
    const supportedEvents = ["checkout.succeeded", "payment.succeeded", "checkout.completed", "subscription.active"];
    if (supportedEvents.includes(body.type)) {
      const metadata = body.data?.meta_data || body.data?.metadata || {};
      const storeId = metadata.storeId;
      const externalChargeId = body.data?.id;

      if (storeId) {
        // Find product ID to map to tier if needed
        // For now, we assume any successful checkout for this app moves them to PRO
        await prisma.billingSubscription.upsert({
          where: { storeId },
          update: {
            active: true,
            tier: "PRO",
            externalChargeId,
            updatedAt: new Date(),
          },
          create: {
            storeId,
            active: true,
            tier: "PRO",
            externalChargeId,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day safety
          },
        });

        console.log(`Successfully updated billing for store: ${storeId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
