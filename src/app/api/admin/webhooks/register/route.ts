import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";
import { ensureShopifyWebhooks } from "@/lib/shopify/webhooks";
import { enqueueRetryJob } from "@/lib/jobs/queue";
import { UserRole } from "@prisma/client";

const schema = z.object({
  storeId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const unauthorized = await enforceAdminRole(req, {
    storeId: parsed.data.storeId,
    minimumRole: UserRole.OWNER
  });
  if (unauthorized) {
    return unauthorized;
  }

  const store = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const result = await ensureShopifyWebhooks({
    shopDomain: store.shopDomain,
    accessToken: store.accessToken
  });

  if (result.errors.length > 0) {
    await enqueueRetryJob({
      storeId: store.id,
      type: "ENSURE_WEBHOOKS",
      payload: { source: "admin_webhooks_register" },
      errorMessage: JSON.stringify(result.errors)
    });
  }

  return NextResponse.json({ ok: true, ...result });
}
