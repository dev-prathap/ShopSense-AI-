import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { getMonthlyUsage } from "@/lib/billing/usage-tracking";

const querySchema = z.object({
  storeId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId } = parsed.data;

    // Ensure user has access to this store
    const unauthorized = await enforceAdminRole(req, {
      storeId,
      minimumRole: UserRole.STAFF
    });
    if (unauthorized) {
      return unauthorized;
    }

    const usage = await getMonthlyUsage(storeId);

    return NextResponse.json({
      usage: {
        currentMonthMessages: usage.currentMonthMessages,
        monthlyLimit: usage.monthlyLimit,
        percentageUsed: Math.round(usage.percentageUsed * 100) / 100, // Round to 2 decimals
        isOverLimit: usage.isOverLimit,
        resetDate: usage.resetDate.toISOString()
      }
    });

  } catch (error) {
    console.error("Usage stats fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}