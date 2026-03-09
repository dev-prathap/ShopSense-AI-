import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { processRetryJobs } from "@/lib/jobs/queue";
import { UserRole } from "@prisma/client";

const schema = z.object({
  storeId: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional()
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
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

  const result = await processRetryJobs({
    storeId: parsed.data.storeId,
    limit: parsed.data.limit
  });

  return NextResponse.json({ ok: true, ...result });
}
