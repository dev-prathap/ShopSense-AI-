"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Script from "next/script";

function ShopifyAuthHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [bridgeReady, setBridgeReady] = useState(false);

  useEffect(() => {
    if (!bridgeReady) return;

    async function authenticate() {
      const shop = searchParams.get("shop");
      const host = searchParams.get("host");

      if (!shop) {
        window.location.href = "/login";
        return;
      }

      try {
        // Get session token from App Bridge (injected by Shopify CDN)
        const shopify = (window as any).shopify;
        if (!shopify?.idToken) {
          setError("App Bridge not available. Please reload.");
          return;
        }

        const token = await shopify.idToken();
        if (!token) {
          setError("Failed to get session token from Shopify.");
          return;
        }

        // Exchange for app session
        const res = await fetch("/api/shopify/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Authentication failed");
          return;
        }

        const { storeId } = await res.json();
        window.location.href = `/dashboard?storeId=${storeId}`;
      } catch (err) {
        console.error("Shopify auth failed:", err);
        setError("Failed to connect. Please reload.");
      }
    }

    authenticate();
  }, [bridgeReady, searchParams]);

  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "";

  return (
    <>
      <Script
        src={`https://cdn.shopify.com/shopifycloud/app-bridge.js?apiKey=${apiKey}`}
        onLoad={() => setBridgeReady(true)}
        strategy="afterInteractive"
      />
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Sparkles className="text-white" size={16} fill="currentColor" />
          </div>
          {error ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold text-blue-600 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <Loader2 className="animate-spin text-slate-300" size={28} />
              <p className="text-[13px] font-bold text-slate-400 tracking-tight">
                Connecting to Shopify...
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ShopifyAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <Loader2 className="animate-spin text-slate-300" size={28} />
        </div>
      }
    >
      <ShopifyAuthHandler />
    </Suspense>
  );
}
