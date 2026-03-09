import { prisma } from "@/lib/db/prisma";

export async function ensureTrialSubscription(storeId: string) {
  const existing = await prisma.billingSubscription.findUnique({ where: { storeId } });
  if (existing) {
    return existing;
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  return prisma.billingSubscription.create({
    data: {
      storeId,
      tier: "STARTER",
      trialEndsAt,
      active: true
    }
  });
}
