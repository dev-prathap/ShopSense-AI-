import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { prisma } from "@/lib/db/prisma";

const querySchema = z.object({
  storeId: z.string().min(1)
});

export async function GET(req: NextRequest, context: { params: { conversationId: string } }) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId } = parsed.data;
  const unauthorized = await enforceAdminRole(req, {
    storeId,
    minimumRole: UserRole.STAFF
  });
  if (unauthorized) {
    return unauthorized;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: context.params.conversationId,
      storeId
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 200
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}
