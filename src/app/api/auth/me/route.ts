import { NextRequest, NextResponse } from "next/server";
import { readAppSessionCookie, verifyAppSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = readAppSessionCookie(req);
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const out = await verifyAppSession(token);
  if (!out.valid || !out.payload) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: out.payload.sub,
      email: out.payload.email,
      name: out.payload.name || null,
      provider: out.payload.provider
    }
  });
}
