import { NextRequest, NextResponse } from "next/server";
import { createCreemCheckout } from "@/lib/billing/creem";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await readAppSessionFromServerComponent();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId, productId } = await req.json();
  if (!storeId || !productId) {
    return NextResponse.json({ error: "Missing storeId or productId" }, { status: 400 });
  }

  try {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    const checkout = await createCreemCheckout({
      storeId,
      productId,
      returnUrl: `${baseUrl}/dashboard/billing?success=true&storeId=${storeId}`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true&storeId=${storeId}`,
    });

    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (error) {
    console.error("Checkout creation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
