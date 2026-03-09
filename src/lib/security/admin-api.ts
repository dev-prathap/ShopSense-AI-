import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { canAccessRole } from "@/lib/security/rbac";
import { UserRole } from "@prisma/client";
import { verifyShopifyAdminRequest } from "@/lib/security/shopify-session";

export async function enforceAdminRole(req: NextRequest, input: { storeId: string; minimumRole: UserRole }): Promise<NextResponse | null> {
  const auth = await verifyShopifyAdminRequest(req, input.storeId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  const adminEmail = auth.claims.email?.trim().toLowerCase();
  const shopifyUserId = auth.claims.sub?.trim();
  if (!adminEmail && !shopifyUserId) {
    return NextResponse.json({ error: "missing_admin_identity" }, { status: 401 });
  }

  const user =
    (shopifyUserId
      ? await prisma.user.findFirst({
          where: {
            storeId: input.storeId,
            shopifyUserId
          }
        })
      : null) ||
    (adminEmail
      ? await prisma.user.findUnique({
          where: {
            storeId_email: {
              storeId: input.storeId,
              email: adminEmail
            }
          }
        })
      : null);

  if (!user) {
    return NextResponse.json({ error: "admin_user_not_found" }, { status: 403 });
  }

  if (shopifyUserId && !user.shopifyUserId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { shopifyUserId }
    });
  }

  if (!canAccessRole(user.role as UserRole, input.minimumRole)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  return null;
}
