import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { getMonthlyUsage } from "@/lib/billing/usage-tracking";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  storeId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId } = parsed.data;
    const auth = await requireAppStoreMembership(req, storeId);
    if (!auth.ok) return auth.response;

    const usage = await getMonthlyUsage(storeId);
    return NextResponse.json({
      usage: {
        currentMonthMessages: usage.currentMonthMessages,
        monthlyLimit: usage.monthlyLimit,
        percentageUsed: Math.round(usage.percentageUsed * 100) / 100,
        isOverLimit: usage.isOverLimit,
        resetDate: usage.resetDate.toISOString(),
        tier: usage.tier,
        isTrial: usage.isTrial,
      },
    });
  } catch (error) {
    console.error("App usage stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch usage statistics" }, { status: 500 });
  }
}
