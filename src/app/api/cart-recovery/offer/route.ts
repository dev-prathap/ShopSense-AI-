import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRecoveryOffer } from "@/lib/recovery/service";
import { prisma } from "@/lib/db/prisma";
import { verifyWidgetAccess } from "@/lib/security/guards";
import { reserveIdempotencyKey } from "@/lib/security/idempotency";

const schema = z.object({
  storeId: z.string().min(1),
  conversationId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = verifyWidgetAccess(req, { storeId: parsed.data.storeId });
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const idempotency = await reserveIdempotencyKey(
    `recovery:${parsed.data.storeId}:${parsed.data.conversationId}`,
    req.headers.get("idempotency-key")
  );
  if (!idempotency.ok) {
    return NextResponse.json({ error: idempotency.reason }, { status: 409 });
  }

  const store = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (!store.recoveryEnabled) {
    return NextResponse.json({ error: "recovery_disabled" }, { status: 403 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: parsed.data.conversationId,
      storeId: parsed.data.storeId
    }
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const offer = await createRecoveryOffer(store.id, parsed.data.conversationId, store.cartRecoveryDiscountPct);

  return NextResponse.json({
    offerCode: offer.offerCode,
    discountPct: offer.discountPct,
    prompt: `Wait, before you go: use ${offer.offerCode} for ${offer.discountPct}% off.`
  });
}
