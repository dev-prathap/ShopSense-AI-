import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { shopifyInstallUrl } from "@/lib/shopify/client";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  const state = crypto.randomUUID();
  const installUrl = shopifyInstallUrl(shop, state);

  const response = NextResponse.redirect(installUrl);
  const appSessionToken = readAppSessionCookie(req);
  if (appSessionToken) {
    const appSession = await verifyAppSession(appSessionToken);
    if (appSession.valid) {
      response.cookies.set("asa_pending_app_user_id", appSession.payload.sub, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10 * 60
      });
    }
  }

  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}
