import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { inferKnowledgeReadiness } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  const token = readAppSessionCookie(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await verifyAppSession(token);
  if (!session.valid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const membership = await prisma.appUserStoreMembership.findFirst({
    where: {
      appUserId: session.payload.sub,
      storeId: parsed.data.storeId
    },
    include: {
      store: {
        select: {
          onboardingStep: true,
          onboardingCompletedAt: true,
          knowledgeReadyAt: true,
          supportEmail: true,
          handoffWebhookUrl: true,
          aiTone: true
        }
      }
    }
  });

  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const knowledge = await prisma.knowledgeSource.findMany({
    where: { storeId: parsed.data.storeId },
    select: { type: true, status: true }
  });
  const knowledgeReady = inferKnowledgeReadiness(knowledge);

  return NextResponse.json({
    storeId: parsed.data.storeId,
    onboardingStep: membership.store.onboardingStep,
    onboardingCompletedAt: membership.store.onboardingCompletedAt,
    knowledgeReadyAt: membership.store.knowledgeReadyAt,
    knowledgeReady,
    aiTone: membership.store.aiTone,
    supportEmail: membership.store.supportEmail,
    handoffWebhookUrl: membership.store.handoffWebhookUrl
  });
}
