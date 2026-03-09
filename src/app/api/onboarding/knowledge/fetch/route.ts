import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { fetchKnowledgeSources } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  sourceIds: z.array(z.string().min(1)).optional(),
  force: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await requireAppStoreMembership(req, parsed.data.storeId);
  if (!auth.ok) {
    return auth.response;
  }

  const out = await fetchKnowledgeSources({
    storeId: parsed.data.storeId,
    sourceIds: parsed.data.sourceIds,
    force: parsed.data.force,
    idempotencyKey: req.headers.get("idempotency-key")
  });

  if (!out.ok) {
    return NextResponse.json({ error: out.reason }, { status: 409 });
  }

  return NextResponse.json({ ok: true, result: out.result });
}
