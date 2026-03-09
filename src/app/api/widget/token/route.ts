import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { issueStoreToken } from "@/lib/security/store-token";
import { prisma } from "@/lib/db/prisma";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { UserRole } from "@prisma/client";

const schema = z.object({
  storeId: z.string().min(1),
  visitorId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const unauthorized = await enforceAdminRole(req, {
    storeId: parsed.data.storeId,
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const store = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const token = issueStoreToken({
    storeId: parsed.data.storeId,
    visitorId: parsed.data.visitorId,
    scope: "widget",
    expiresInSeconds: 60 * 30
  });

  return NextResponse.json({ token, expiresInSeconds: 60 * 30 });
}
