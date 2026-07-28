"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Sparkles, ArrowRight, AlertCircle, Package, FileText, MessageSquare, Code } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";

const STEPS = ["Welcome", "Connect Store", "Activate Plan"];

function normalizeShopDomain(raw: string): { normalized: string; valid: boolean } {
  let val = raw.trim().toLowerCase();
  val = val.replace(/^https?:\/\//, "");
  val = val.split("/")[0].split("?")[0];
  val = val.replace(/\.$/, "");
  if (!val.includes(".")) {
    val = `${val}.myshopify.com`;
  }
  const valid = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(val);
  return { normalized: val, valid };
}

/**
 * These describe what Neryn actually does with the access it is granted. The
 * fourth item used to read "Read-only access", under a line promising Neryn
 * never writes to the store — untrue on both counts: the app installs a script
 * tag (a write), and shopify.app.toml requests write scopes for products,
 * product listings, orders, customers and cart transforms. Telling a merchant
 * the opposite on the consent screen is a misrepresentation of what they are
 * approving, and the kind of thing App Store review treats seriously.
 */
const PERMISSIONS = [
  { icon: <Package size={13} />, label: "Products & Variants" },
  { icon: <FileText size={13} />, label: "Store Policies" },
  { icon: <MessageSquare size={13} />, label: "Order Status" },
  { icon: <Code size={13} />, label: "Storefront widget script" },
];

export default function OnboardingConnectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState("");
  const [error, setError] = useState("");
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError === "oauth_failed") {
      setError("Shopify authorization failed. Please try connecting again.");
    } else if (oauthError === "invalid_signature") {
      setError("Security verification failed. Please try connecting again.");
    }
  }, [searchParams]);

  /**
   * Inside the Shopify admin iframe the app is by definition already installed,
   * so asking for the shop domain again is both redundant and fatal: submitting
   * it runs OAuth, which ends at accounts.shopify.com with X-Frame-Options:
   * deny, and the frame goes permanently blank. Recover through token exchange
   * (/shopify/auth) instead, which needs no redirect out of the iframe at all.
   */
  useEffect(() => {
    if (typeof window === "undefined" || window.top === window.self) {
      return;
    }

    setRecovering(true);
    let cancelled = false;

    (async () => {
      // App Bridge loads synchronously in <head>, so window.shopify is normally
      // ready immediately. Poll briefly as a safety net for slow init.
      for (let i = 0; i < 20 && !cancelled; i++) {
        const shopDomain =
          searchParams.get("shop") || (window as any).shopify?.config?.shop;
        if (shopDomain) {
          window.location.href = `/shopify/auth?shop=${encodeURIComponent(shopDomain)}`;
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
      // Couldn't identify the shop — fall back to the manual form, which submits
      // through the top window rather than the iframe.
      if (!cancelled) setRecovering(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.trim()) {
      const { normalized } = normalizeShopDomain(e.target.value);
      setShop(normalized);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!shop.trim()) {
      setError("Please enter your Shopify store domain.");
      return;
    }

    const { normalized, valid } = normalizeShopDomain(shop);
    if (!valid) {
      setError(`Invalid domain format. Expected something like "your-store.myshopify.com".`);
      return;
    }

    setIsLoading(true);
    // OAuth terminates at accounts.shopify.com, which sets X-Frame-Options:
    // deny — it can never render inside the Shopify admin iframe. Always drive
    // the top window. The URL must be absolute: window.top resolves relative
    // paths against admin.shopify.com, not against this app's origin.
    const installUrl = new URL(
      `/api/shopify/install?shop=${encodeURIComponent(normalized)}`,
      window.location.origin
    ).toString();
    (window.top ?? window).location.href = installUrl;
  };

  if (recovering) {
    return (
      <OnboardingShell>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="h-9 w-9 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Sparkles className="text-white" size={16} fill="currentColor" />
          </div>
          <Loader2 className="animate-spin text-slate-300" size={28} />
          <p className="text-[13px] font-bold text-slate-400 tracking-tight">
            Connecting to Shopify...
          </p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <OnboardingProgress steps={STEPS} currentStep={1} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-10 md:p-14">

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="relative h-20 w-20 mb-7">
                <div className="h-20 w-20 rounded-2xl bg-[#95BF47] flex items-center justify-center shadow-xl shadow-[#95BF47]/25 rotate-3">
                  <img src="/shopify/glyph.svg" alt="Shopify" className="h-10 w-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-lg border-2 border-white">
                  <Sparkles size={13} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">
                Connect your store
              </h2>
              <p className="text-slate-500 font-medium text-[14px] leading-relaxed max-w-[320px]">
                Sync your catalog to activate your autonomous AI sales agent.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div className="relative">
                <Input
                  value={shop}
                  onChange={(e) => { setShop(e.target.value); setError(""); }}
                  onBlur={handleBlur}
                  required
                  disabled={isLoading}
                  placeholder="your-store.myshopify.com"
                  className="h-14 border-slate-200 bg-slate-50/50 px-5 text-base font-medium rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all placeholder:text-slate-300 pr-44"
                />
                {shop && !shop.includes(".myshopify.com") && (
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-300 pointer-events-none">
                    .myshopify.com
                  </span>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[13px] text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base font-bold bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-xl shadow-slate-900/10"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" /> Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Authorize Installation <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Permissions panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                Access Neryn requests from Shopify:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {PERMISSIONS.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                    <span className="text-emerald-500">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-3 pt-3 border-t border-slate-200">
                Neryn reads your catalog, policies and order status to answer shopper
                questions. The only thing it writes is the script tag that renders the
                chat widget on your storefront.
              </p>
            </div>

            {/* Back */}
            <Button
              onClick={() => router.push("/onboarding/welcome")}
              variant="ghost"
              className="w-full h-11 font-bold text-slate-400 hover:text-slate-700 text-[12px] uppercase tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-2" /> Back to Welcome
            </Button>

          </CardContent>
        </Card>
      </motion.div>
    </OnboardingShell>
  );
}
