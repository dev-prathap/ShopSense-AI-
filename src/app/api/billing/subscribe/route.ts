import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";
import { createShopifySubscription } from "@/lib/shopify/billing";
import { UserRole } from "@prisma/client";

const schema = z.object({
  storeId: z.string().min(1),
  tier: z.enum(["STARTER", "GROWTH", "PRO"])
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, tier } = parsed.data;
  const unauthorized = await enforceAdminRole(req, {
    storeId,
    minimumRole: UserRole.OWNER
  });
  if (unauthorized) {
    return unauthorized;
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const returnUrl = `${process.env.SHOPIFY_APP_URL}/api/admin/billing/confirm?storeId=${encodeURIComponent(storeId)}&tier=${tier}`;
  const created = await createShopifySubscription({
    shopDomain: store.shopDomain,
    accessToken: store.accessToken,
    tier,
    returnUrl
  });

  if (created.userErrors.length > 0 || !created.confirmationUrl) {
    return NextResponse.json({ error: created.userErrors[0]?.message || "billing_subscription_create_failed" }, { status: 400 });
  }

  return NextResponse.json({
    confirmationUrl: created.confirmationUrl
  });
}
