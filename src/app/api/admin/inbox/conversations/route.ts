import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";

const querySchema = z.object({
  storeId: z.string().min(1),
  status: z.enum(["OPEN", "HANDOFF_REQUESTED", "RESOLVED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, status, limit } = parsed.data;
  const unauthorized = await enforceAdminRole(req, {
    storeId,
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const rows = await prisma.conversation.findMany({
    where: {
      storeId,
      ...(status ? { status } : {})
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" },
    take: limit || 30
  });

  return NextResponse.json({
    conversations: rows.map((row) => ({
      id: row.id,
      visitorId: row.visitorId,
      status: row.status,
      handoffReason: row.handoffReason,
      handoffNotifiedAt: row.handoffNotifiedAt,
      convertedAt: row.convertedAt,
      resolvedAt: row.resolvedAt,
      updatedAt: row.updatedAt,
      latestMessage: row.messages[0]?.content || null,
      latestMessageAt: row.messages[0]?.createdAt || null
    }))
  });
}
