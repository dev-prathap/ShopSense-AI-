import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAppStoreMembership } from "@/lib/auth/app-api";
import { syncCatalog } from "@/lib/shopify/sync";

const bodySchema = z.object({
  storeId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId } = parsed.data;
    const auth = await requireAppStoreMembership(req, storeId);
    if (!auth.ok) return auth.response;

    const result = await syncCatalog(storeId);
    return NextResponse.json({
      ok: true,
      result: {
        synced: result.synced,
        embedded: result.embedded,
        variants: result.variants,
      },
      message: `Successfully synced ${result.synced} products with ${result.variants} variants and ${result.embedded} embeddings`,
    });
  } catch (error: any) {
    console.error("App manual sync failed:", error);
    return NextResponse.json({ ok: false, error: "Sync failed. Please try again." }, { status: 500 });
  }
}
