import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGoogleOAuthUrl } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") || "/dashboard";
  const statePayload = `${crypto.randomUUID()}::${next}`;

  const url = getGoogleOAuthUrl(statePayload);
  const res = NextResponse.redirect(url);
  res.cookies.set("asa_google_oauth_state", statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60
  });

  return res;
}
