import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { issueStoreToken } from "@/lib/security/store-token";
import { requireAppStoreMembership } from "@/lib/auth/app-api";

const schema = z.object({
  storeId: z.string().min(1),
  visitorId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireAppStoreMembership(req, parsed.data.storeId);
  if (!auth.ok) return auth.response;

  const store = await prisma.store.findUnique({ where: { id: parsed.data.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const token = issueStoreToken({
    storeId: parsed.data.storeId,
    visitorId: parsed.data.visitorId,
    scope: "widget",
    expiresInSeconds: 60 * 30,
  });

  return NextResponse.json({ token, expiresInSeconds: 60 * 30 });
}
