import { prisma } from "@/lib/db/prisma";

export interface UsageStats {
  currentMonthMessages: number;
  monthlyLimit: number | null;
  percentageUsed: number;
  isOverLimit: boolean;
  resetDate: Date;
}

/**
 * Get current month's message usage for a store
 */
export async function getMonthlyUsage(storeId: string): Promise<UsageStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Count messages sent by the AI (role = 'assistant') this month
  const currentMonthMessages = await prisma.message.count({
    where: {
      conversation: {
        storeId
      },
      role: 'assistant',
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  });

  // Get billing subscription to determine limits
  const subscription = await prisma.billingSubscription.findUnique({
    where: { storeId }
  });

  // Define tier limits (messages per month)
  const tierLimits = {
    TRIAL: 100,
    STARTER: 500,
    PRO: null // unlimited
  };

  const tier = subscription?.tier || 'TRIAL';
  const monthlyLimit = tierLimits[tier as keyof typeof tierLimits];

  const percentageUsed = monthlyLimit
    ? Math.min((currentMonthMessages / monthlyLimit) * 100, 100)
    : 0;

  const isOverLimit = monthlyLimit ? currentMonthMessages >= monthlyLimit : false;

  return {
    currentMonthMessages,
    monthlyLimit,
    percentageUsed,
    isOverLimit,
    resetDate: nextMonth
  };
}

/**
 * Check if a store has exceeded their message limits
 */
export async function checkUsageLimits(storeId: string): Promise<boolean> {
  const usage = await getMonthlyUsage(storeId);
  return !usage.isOverLimit;
}

/**
 * Track a new message (to be called when AI sends a response)
 */
export async function trackMessageUsage(storeId: string, messageId: string): Promise<void> {
  // The message is already created, we just need to ensure it's counted
  // This function exists for consistency and future webhook tracking if needed

  const usage = await getMonthlyUsage(storeId);

  // Log usage warning if approaching limit
  if (usage.monthlyLimit && usage.percentageUsed > 80) {
    console.warn(`Store ${storeId} approaching message limit: ${usage.currentMonthMessages}/${usage.monthlyLimit} (${usage.percentageUsed.toFixed(1)}%)`);
  }
}