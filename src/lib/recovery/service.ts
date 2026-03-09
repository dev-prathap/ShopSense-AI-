import { prisma } from "@/lib/db/prisma";

export async function createRecoveryOffer(storeId: string, conversationId: string, discountPct = 10) {
  const offerCode = `SAVE${discountPct}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return prisma.recoveryOffer.create({
    data: {
      storeId,
      conversationId,
      offerCode,
      discountPct
    }
  });
}
