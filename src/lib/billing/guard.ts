import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function assertStoreSubscriptionActive(storeId: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const subscription = await prisma.billingSubscription.findUnique({ where: { storeId } });

  if (!subscription) {
    return { ok: false, reason: "subscription_missing" };
  }

  if (!subscription.active) {
    return { ok: false, reason: "subscription_inactive" };
  }

  if (subscription.trialEndsAt < new Date() && !subscription.externalChargeId) {
    return { ok: false, reason: "trial_expired_or_payment_required" };
  }

  return { ok: true };
}
