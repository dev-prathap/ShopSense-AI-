import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("creem-signature");

    // TODO: Verify signature using a secret if Creem provides one
    console.log("Received Creem webhook", body);

    // Event types usually look like: "checkout.succeeded", "payment.succeeded", etc.
    // Based on common billing webhooks:
    if (body.type === "checkout.succeeded" || body.type === "payment.succeeded") {
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
