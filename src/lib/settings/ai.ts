import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function getAiSettings(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      aiTone: true,
      aiMaxRecommendations: true,
      aiHandoffSensitivity: true,
      recoveryEnabled: true,
      cartRecoveryDiscountPct: true,
      supportEmail: true,
      handoffWebhookUrl: true
    }
  });

  return store;
}

export async function updateAiSettings(input: {
  storeId: string;
  aiTone?: string;
  aiMaxRecommendations?: number;
  aiHandoffSensitivity?: number;
  recoveryEnabled?: boolean;
  cartRecoveryDiscountPct?: number;
  supportEmail?: string | null;
  handoffWebhookUrl?: string | null;
}) {
  return prisma.store.update({
    where: { id: input.storeId },
    data: {
      ...(input.aiTone !== undefined ? { aiTone: input.aiTone } : {}),
      ...(input.aiMaxRecommendations !== undefined ? { aiMaxRecommendations: input.aiMaxRecommendations } : {}),
      ...(input.aiHandoffSensitivity !== undefined ? { aiHandoffSensitivity: input.aiHandoffSensitivity } : {}),
      ...(input.recoveryEnabled !== undefined ? { recoveryEnabled: input.recoveryEnabled } : {}),
      ...(input.cartRecoveryDiscountPct !== undefined ? { cartRecoveryDiscountPct: input.cartRecoveryDiscountPct } : {}),
      ...(input.supportEmail !== undefined ? { supportEmail: input.supportEmail } : {}),
      ...(input.handoffWebhookUrl !== undefined ? { handoffWebhookUrl: input.handoffWebhookUrl } : {})
    },
    select: {
      id: true,
      aiTone: true,
      aiMaxRecommendations: true,
      aiHandoffSensitivity: true,
      recoveryEnabled: true,
      cartRecoveryDiscountPct: true,
      supportEmail: true,
      handoffWebhookUrl: true
    }
  });
}
