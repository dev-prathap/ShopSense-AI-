import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { z } from "zod";

const schema = z.object({
  storeId: z.string(),
  businessName: z.string().nullable().optional(),
  brandPersona: z.string().nullable().optional(),
  brandDescription: z.string().nullable().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")).or(z.null()),
  aiTone: z.string().optional(),
  aiHandoffSensitivity: z.number().min(0).max(100).optional()
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  
  if (!storeId) {
    return NextResponse.json({ error: "missing_store_id" }, { status: 400 });
  }

  const auth = await requireAppStoreMembership(req, storeId);
  if (!auth.ok) return auth.response;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      businessName: true,
      brandPersona: true,
      brandDescription: true,
      supportEmail: true,
      aiTone: true,
      aiHandoffSensitivity: true
    }
  });

  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, ...data } = parsed.data;

  const auth = await requireAppStoreMembership(req, storeId);
  if (!auth.ok) return auth.response;

  try {
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...data,
        // If they cleared the email, set it to null in DB
        supportEmail: data.supportEmail || null
      }
    });

    return NextResponse.json({ ok: true, store: updated });
  } catch (err) {
    console.error("Failed to update business context", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
