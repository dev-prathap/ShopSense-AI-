import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { updateSourceSummary } from "@/lib/knowledge/service";

const schema = z.object({
  storeId: z.string().min(1),
  sourceId: z.string().min(1),
  summaryText: z.string().min(1),
  publish: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { storeId, sourceId, summaryText, publish } = parsed.data;

  const auth = await requireAppStoreMembership(req, storeId);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const result = await updateSourceSummary({
      storeId,
      sourceId,
      summaryText,
      publish
    });

    return NextResponse.json({
      ok: true,
      sources: result.sources,
      ready: result.ready
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "update_failed"
    }, { status: 500 });
  }
}
