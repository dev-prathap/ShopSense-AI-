import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Accepts either identifier.
 *
 * The theme app extension is served from Shopify's CDN, so its script URL
 * carries no store id — the app embed block only knows the shop domain. The
 * direct embed on Neryn's own site still passes a store id. Neither reveals
 * anything new: the store id already appears in the widget iframe URL in the
 * page source.
 */
const querySchema = z
  .object({
    storeId: z.string().min(1).optional(),
    shop: z.string().min(1).optional()
  })
  .refine((v) => Boolean(v.storeId || v.shop), {
    message: "storeId or shop is required"
  });

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId, shop } = parsed.data;

    const store = await prisma.store.findFirst({
      where: {
        ...(storeId ? { id: storeId } : { shopDomain: shop!.trim().toLowerCase() }),
        // A shop that has uninstalled should stop getting a widget, even if the
        // app embed is still switched on in their theme.
        uninstalledAt: null
      },
      select: {
        id: true,
        businessName: true,
        brandDescription: true,
        shopDomain: true,
        supportEmail: true
        // Don't expose sensitive fields like access tokens
      }
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        storeId: store.id,
        businessName: store.businessName || "Our Store",
        brandDescription: store.brandDescription || "Welcome to our store!",
        shopDomain: store.shopDomain,
        supportEmail: store.supportEmail
      },
      {
        headers: {
          // Called cross-origin by the theme app extension from the merchant's
          // storefront, whose domain is theirs and not enumerable here. The
          // payload is public shop branding, so it is readable by anyone.
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=60"
        }
      }
    );
  } catch (error) {
    console.error("Store info fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch store information" },
      { status: 500 }
    );
  }
}
