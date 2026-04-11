import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE, verifyAppSession } from "@/lib/auth/session";

const protectedPrefixes = ["/dashboard", "/onboarding"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";
  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));
  const isLandingPage = path === "/";

  if (!isProtected && !isAuthPage && !isLandingPage) {
    return NextResponse.next();
  }

  const token = req.cookies.get(APP_SESSION_COOKIE)?.value;

  // For protected routes, require authentication
  if (isProtected) {
    const shop = req.nextUrl.searchParams.get("shop");
    const host = req.nextUrl.searchParams.get("host");
    const isShopifyEmbedded = !!(shop || host);

    if (!token) {
      // If opened from Shopify admin (has shop/host params), let the page handle App Bridge auth
      if (isShopifyEmbedded) {
        return NextResponse.next();
      }
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const out = await verifyAppSession(token);
    if (!out.valid) {
      if (isShopifyEmbedded) {
        return NextResponse.next();
      }
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // For auth pages, redirect to dashboard if already logged in
  if (isAuthPage && token) {
    const out = await verifyAppSession(token);
    if (out.valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // For landing page, redirect to dashboard if already logged in
  if (isLandingPage && token) {
    const out = await verifyAppSession(token);
    if (out.valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"]
};
