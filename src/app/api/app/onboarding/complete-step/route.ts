import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  storeId: z.string().min(1),
  step: z.number().int().min(1).max(7)
});

export async function POST(req: NextRequest) {
  const token = readAppSessionCookie(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await verifyAppSession(token);
  if (!session.valid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const membership = await prisma.appUserStoreMembership.findFirst({
    where: {
      appUserId: session.payload.sub,
      storeId: parsed.data.storeId
    }
  });
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const nextStep = Math.min(7, parsed.data.step + 1);
  const completed = parsed.data.step >= 7;

  const store = await prisma.store.update({
    where: { id: parsed.data.storeId },
    data: {
      onboardingStep: {
        set: nextStep
      },
      ...(completed ? { onboardingCompletedAt: new Date() } : {})
    },
    select: {
      id: true,
      onboardingStep: true,
      onboardingCompletedAt: true
    }
  });

  return NextResponse.json({ ok: true, store });
}
