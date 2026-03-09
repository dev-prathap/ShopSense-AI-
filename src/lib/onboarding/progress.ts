import "server-only";

import { prisma } from "@/lib/db/prisma";
import { inferKnowledgeReadiness } from "@/lib/knowledge/service";

export async function computeStoreOnboardingProgress(storeId: string) {
  const [store, sources, testedConversation] = await Promise.all([
    prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        businessName: true,
        brandDescription: true,
        aiTone: true,
        supportEmail: true,
        handoffWebhookUrl: true,
        onboardingStep: true,
        onboardingCompletedAt: true
      }
    }),
    prisma.knowledgeSource.findMany({
      where: { storeId },
      select: { type: true, status: true }
    }),
    prisma.conversation.findFirst({
      where: { storeId },
      select: { id: true }
    })
  ]);

  if (!store) {
    return null;
  }

  const knowledgeReady = inferKnowledgeReadiness(sources);
  const businessReady = Boolean(store.businessName?.trim() && store.brandDescription?.trim());
  const aiReady = Boolean(store.aiTone);
  const handoffReady = Boolean(store.supportEmail || store.handoffWebhookUrl);
  const testConversationReady = Boolean(testedConversation);
  const goLiveReady = businessReady && knowledgeReady && aiReady && handoffReady && testConversationReady;

  const completedStep = [
    businessReady,
    knowledgeReady,
    knowledgeReady,
    aiReady,
    handoffReady,
    testConversationReady,
    goLiveReady
  ];

  const firstPending = completedStep.findIndex((v) => !v);
  const derivedStep = firstPending === -1 ? 7 : firstPending + 1;
  const finalStep = Math.max(store.onboardingStep, derivedStep);

  return {
    step: finalStep,
    completed: store.onboardingCompletedAt,
    businessReady,
    knowledgeReady,
    aiReady,
    handoffReady,
    testConversationReady,
    goLiveReady,
    completedStep
  };
}
