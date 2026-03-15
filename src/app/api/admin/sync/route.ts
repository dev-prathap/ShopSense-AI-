import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { enforceAdminRole } from "@/lib/security/admin-api";
import { syncCatalog } from "@/lib/shopify/sync";

const bodySchema = z.object({
  storeId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId } = parsed.data;

    // Ensure user has admin access to this store
    const unauthorized = await enforceAdminRole(req, {
      storeId,
      minimumRole: UserRole.OWNER // Only admins can trigger sync
    });
    if (unauthorized) {
      return unauthorized;
    }

    // Perform the sync operation
    const result = await syncCatalog(storeId);

    return NextResponse.json({
      ok: true,
      result: {
        synced: result.synced,
        embedded: result.embedded,
        variants: result.variants
      },
      message: `Successfully synced ${result.synced} products with ${result.variants} variants and ${result.embedded} embeddings`
    });

  } catch (error: any) {
    console.error("Manual sync failed:", error);

    // Return user-friendly error messages for common issues
    if (error.message?.includes("insufficient scope") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({
        ok: false,
        error: "Insufficient Shopify permissions. Please reinstall the app."
      }, { status: 403 });
    }

    if (error.message?.includes("rate limit") || error.message?.includes("throttle")) {
      return NextResponse.json({
        ok: false,
        error: "Shopify API rate limit reached. Please try again in a few minutes."
      }, { status: 429 });
    }

    return NextResponse.json({
      ok: false,
      error: "Sync failed. Please try again or contact support if the issue persists."
    }, { status: 500 });
  }
}