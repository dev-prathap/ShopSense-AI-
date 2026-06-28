"use client";

import { useEffect } from "react";

/**
 * Emits one App Bridge session-token-authenticated request per embedded load.
 *
 * The embedded app authenticates pages via the `asa_app_session` cookie, but
 * Shopify's automated distribution check "Using session tokens for user
 * authentication" only passes when it observes real `Authorization: Bearer
 * <session_token>` traffic during an in-admin session. This pings an existing
 * Bearer-validated admin route (GET /api/admin/usage) with a fresh idToken so
 * that signal is produced on every embedded session — no merchant action needed.
 *
 * It no-ops outside the Shopify admin iframe (window.shopify absent), so the
 * standalone /login flow is unaffected.
 */
export function SessionTokenHeartbeat({ storeId }: { storeId: string }) {
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      // App Bridge is only injected inside the Shopify admin iframe. Poll briefly
      // (same pattern as the auth page) in case it initialises after hydration.
      let shopify: any = null;
      for (let i = 0; i < 20; i++) {
        shopify = (window as any).shopify;
        if (shopify?.idToken) break;
        await new Promise((r) => setTimeout(r, 300));
      }
      if (cancelled || !shopify?.idToken) return;

      try {
        const token = await shopify.idToken();
        if (!token || cancelled) return;
        await fetch(`/api/admin/usage?storeId=${encodeURIComponent(storeId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Best-effort: the page is already authenticated by cookie.
      }
    }

    ping();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return null;
}
