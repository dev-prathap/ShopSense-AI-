import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { clearAppSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAppSessionCookie(res);
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
  clearAppSessionCookie(res);
  return res;
}
