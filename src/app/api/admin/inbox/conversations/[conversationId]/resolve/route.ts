import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";

const bodySchema = z.object({
  storeId: z.string().min(1),
  resolutionNote: z.string().max(1000).optional()
});

export async function POST(req: NextRequest, context: { params: { conversationId: string } }) {
  const parsed = bodySchema.safeParse(await req.json());
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

  const updated = await prisma.conversation.updateMany({
    where: {
      id: context.params.conversationId,
      storeId: parsed.data.storeId
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolutionNote: parsed.data.resolutionNote || null
    }
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
