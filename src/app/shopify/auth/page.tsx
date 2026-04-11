"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Sparkles } from "lucide-react";

function ShopifyAuthHandler() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function authenticate() {
      const shop = searchParams.get("shop");
      const host = searchParams.get("host");

      if (!shop) {
        // Not in Shopify context — redirect to normal login
        window.location.href = "/login";
        return;
      }

      try {
        // Fetch session token via Shopify's App Bridge CDN (works in embedded iframe)
        const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || "";

        // Use the id_token from Shopify's managed install flow if available
        const idToken = searchParams.get("id_token");
        let token = idToken;

        if (!token) {
          // Fallback: redirect to Shopify OAuth to get a proper session
          const installUrl = `/api/shopify/install?shop=${encodeURIComponent(shop)}`;
          window.location.href = installUrl;
          return;
        }

        // Exchange Shopify session token for app session
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

        // Redirect to dashboard with store context
        window.location.href = `/dashboard?storeId=${storeId}`;
      } catch (err) {
        console.error("Shopify auth failed:", err);
        setError("Failed to authenticate with Shopify. Please reload.");
      }
    }

    authenticate();
  }, [searchParams]);

  return (
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
