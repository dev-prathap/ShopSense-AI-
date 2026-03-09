import { NextRequest, NextResponse } from "next/server";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const token = readAppSessionCookie(req);
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const session = await verifyAppSession(token);
  if (!session.valid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.appUserStoreMembership.findMany({
    where: { appUserId: session.payload.sub },
    include: {
      store: {
        select: {
          id: true,
          shopDomain: true,
          onboardingStep: true,
          onboardingCompletedAt: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({
    stores: memberships.map((m) => ({
      id: m.store.id,
      shopDomain: m.store.shopDomain,
      role: m.role,
      onboardingStep: m.store.onboardingStep,
      onboardingCompletedAt: m.store.onboardingCompletedAt
    }))
  });
}
