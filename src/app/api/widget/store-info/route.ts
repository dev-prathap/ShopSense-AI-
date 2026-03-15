import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const querySchema = z.object({
  storeId: z.string().min(1)
});

export async function GET(req: NextRequest) {
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { storeId } = parsed.data;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        businessName: true,
        brandDescription: true,
        shopDomain: true,
        supportEmail: true,
        // Don't expose sensitive fields like access tokens
      }
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      businessName: store.businessName || "Our Store",
      brandDescription: store.brandDescription || "Welcome to our store!",
      shopDomain: store.shopDomain,
      supportEmail: store.supportEmail
    });

  } catch (error) {
    console.error("Store info fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch store information" },
      { status: 500 }
    );
  }
}