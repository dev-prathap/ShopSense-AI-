import { prisma } from "@/lib/db/prisma";

export async function ensureTrialSubscription(storeId: string) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  try {
    // Use upsert to handle race conditions atomically
    return await prisma.billingSubscription.upsert({
      where: { storeId },
      update: {}, // Don't update existing subscriptions
      create: {
        storeId,
        tier: "STARTER",
        trialEndsAt,
        active: true
      }
    });
  } catch (error: any) {
    // If upsert fails due to unique constraint violation during create,
    // try to fetch the existing record (another request created it)
    if (error.code === 'P2002') {
      const existing = await prisma.billingSubscription.findUnique({ where: { storeId } });
      if (existing) {
        return existing;
      }
    }
    throw error; // Re-throw unexpected errors
  }
}
