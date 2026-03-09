import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { UserRole } from "@prisma/client";

const schema = z.object({
  storeId: z.string().min(1),
  tier: z.enum(["STARTER", "GROWTH", "PRO"]).optional(),
  charge_id: z.string().optional()
});

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, tier, charge_id } = parsed.data;
  const unauthorized = await enforceAdminRole(req, {
    storeId,
    minimumRole: UserRole.OWNER
  });
  if (unauthorized) {
    return unauthorized;
  }

  await prisma.billingSubscription.upsert({
    where: { storeId },
    update: {
      tier: tier || "STARTER",
      active: true,
      externalChargeId: charge_id || null
    },
    create: {
      storeId,
      tier: tier || "STARTER",
      active: true,
      externalChargeId: charge_id || null,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  return NextResponse.redirect(`${process.env.SHOPIFY_APP_URL}/dashboard?storeId=${storeId}`);
}
