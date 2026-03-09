import { NextResponse } from "next/server";
import { clearAppSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAppSessionCookie(res);
  return res;
}
