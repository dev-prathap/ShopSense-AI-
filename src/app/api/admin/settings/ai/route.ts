import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { UserRole } from "@prisma/client";
import { getAiSettings, updateAiSettings } from "@/lib/settings/ai";

const getSchema = z.object({
  storeId: z.string().min(1)
});

const updateSchema = z.object({
  storeId: z.string().min(1),
  aiTone: z.enum(["concise_sales", "consultative", "friendly"]).optional(),
  aiMaxRecommendations: z.number().int().min(1).max(5).optional(),
  aiHandoffSensitivity: z.number().int().min(0).max(100).optional(),
  recoveryEnabled: z.boolean().optional(),
  cartRecoveryDiscountPct: z.number().int().min(0).max(50).optional(),
  supportEmail: z.string().email().nullable().optional(),
  handoffWebhookUrl: z.string().url().nullable().optional()
});

export async function GET(req: NextRequest) {
  const parsed = getSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const unauthorized = await enforceAdminRole(req, {
    storeId: parsed.data.storeId,
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const settings = await getAiSettings(parsed.data.storeId);
  if (!settings) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const unauthorized = await enforceAdminRole(req, {
    storeId: parsed.data.storeId,
    minimumRole: UserRole.OWNER
  });
  if (unauthorized) {
    return unauthorized;
  }

  const settings = await updateAiSettings(parsed.data);
  return NextResponse.json(settings);
}
