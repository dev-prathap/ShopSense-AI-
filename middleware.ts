import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE, verifyAppSession } from "@/lib/auth/session";

const protectedPrefixes = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";
  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get(APP_SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const out = await verifyAppSession(token);
  if (!out.valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"]
};
