import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { syncCatalog } from "@/lib/shopify/sync";
import { enforceAdminRole } from "@/lib/security/admin-api";
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
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const result = await syncCatalog(parsed.data.storeId);
  return NextResponse.json(result);
}
