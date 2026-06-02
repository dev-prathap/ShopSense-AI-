import { prisma } from "@/lib/db/prisma";
import { SubscriptionTier } from "@prisma/client";

export interface UsageStats {
  currentMonthMessages: number;
  monthlyLimit: number | null;
  percentageUsed: number;
  isOverLimit: boolean;
  resetDate: Date;
  tier: SubscriptionTier | null;
  isTrial: boolean;
}

/** Messages per month by tier. null = unlimited. Must match copy in /dashboard/billing. */
const TIER_LIMITS: Record<string, number | null> = {
  STARTER: 500,
  GROWTH: 2500,
  PRO: null,
  ENTERPRISE: null,
};

const TRIAL_LIMIT = 100;

/**
 * Get current month's message usage for a store
 */
export async function getMonthlyUsage(storeId: string): Promise<UsageStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [messageCount, subscription] = await Promise.all([
    prisma.message.count({
      where: {
        conversation: { storeId },
        role: "assistant",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.billingSubscription.findUnique({ where: { storeId } }),
  ]);

  const isTrial = !subscription || (!subscription.externalChargeId && subscription.trialEndsAt && subscription.trialEndsAt > new Date());
  const monthlyLimit = isTrial ? TRIAL_LIMIT : (TIER_LIMITS[subscription?.tier ?? ""] ?? null);

  const percentageUsed = monthlyLimit
    ? Math.min((messageCount / monthlyLimit) * 100, 100)
    : 0;

  return {
    currentMonthMessages: messageCount,
    monthlyLimit,
    percentageUsed,
    isOverLimit: monthlyLimit ? messageCount >= monthlyLimit : false,
    resetDate: nextMonth,
    tier: subscription?.tier ?? null,
    isTrial,
  };
}

/**
 * Check if a store has exceeded their message limits.
 * Returns true if within limits, false if over.
 */
export async function checkUsageLimits(storeId: string): Promise<boolean> {
  const usage = await getMonthlyUsage(storeId);
  return !usage.isOverLimit;
}