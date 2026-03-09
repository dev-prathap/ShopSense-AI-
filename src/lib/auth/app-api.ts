import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";

export async function requireAppStoreMembership(req: NextRequest, storeId: string) {
  const token = readAppSessionCookie(req);
  if (!token) {
    return { ok: false as const, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const session = await verifyAppSession(token);
  if (!session.valid) {
    return { ok: false as const, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  const membership = await prisma.appUserStoreMembership.findFirst({
    where: {
      appUserId: session.payload.sub,
      storeId
    }
  });
  if (!membership) {
    return { ok: false as const, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, appUserId: session.payload.sub };
}
