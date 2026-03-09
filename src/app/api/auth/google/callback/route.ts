import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { exchangeGoogleCodeForProfile } from "@/lib/auth/google";
import { setAppSessionCookie, signAppSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("asa_google_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=google_state", process.env.SHOPIFY_APP_URL || req.nextUrl.origin));
  }

  const profile = await exchangeGoogleCodeForProfile(code).catch(() => null);
  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=google_exchange", process.env.SHOPIFY_APP_URL || req.nextUrl.origin));
  }

  const user = await prisma.appUser.upsert({
    where: { email: profile.email },
    update: {
      name: profile.name,
      authProvider: "google",
      googleSub: profile.sub
    },
    create: {
      email: profile.email,
      name: profile.name,
      authProvider: "google",
      googleSub: profile.sub
    }
  });

  const token = await signAppSession({
    sub: user.id,
    email: user.email,
    name: user.name || undefined,
    provider: "google"
  });

  const [_, nextPath] = state.split("::");
  const redirectPath = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";
  const res = NextResponse.redirect(new URL(redirectPath, process.env.SHOPIFY_APP_URL || req.nextUrl.origin));
  setAppSessionCookie(res, token);
  res.cookies.set("asa_google_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return res;
}
