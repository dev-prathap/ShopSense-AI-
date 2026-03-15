"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, Loader2, Sparkles } from "lucide-react";

function ShopifyIcon({ className }: { className?: string }) {
  return (
    <img src="/shopify/glyph.svg" alt="Shopify" className={className} />
  );
}

export default function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop.trim()) return;
    setIsLoading(true);
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(shop.trim())}`;
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#fafafa] px-4">
      {/* Ultra-subtle mesh gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50/50 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-50/50 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="flex justify-center mb-12"
        >
          <Link 
            href="/dashboard" 
            className="group inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-100 p-10 md:p-14">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-10">
                <div className="h-24 w-24 rounded-[30px] bg-[#95BF47] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(149,191,71,0.3)] rotate-3">
                  <ShopifyIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-slate-900 border-4 border-white flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={16} fill="currentColor" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Connect Shopify</h1>
              <p className="text-slate-500 font-medium leading-relaxed mb-12">
                Sync your store catalog to activate your autonomous AI sales agent.
              </p>

              <form 
                onSubmit={handleSubmit}
                className="w-full space-y-6"
              >
                <div className="relative group">
                  <Input
                    id="shop"
                    name="shop"
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="your-store.myshopify.com"
                    className="h-16 border-slate-200 bg-slate-50/50 px-6 text-lg font-medium transition-all focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 rounded-2xl placeholder:text-slate-300"
                  />
                  <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Verify domain</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-16 text-lg font-bold bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connecting...
                    </div>
                  ) : (
                    "Authorize Installation"
                  )}
                </Button>
              </form>

              <div className="mt-12 flex flex-col items-center gap-6">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" alt="" />
                    ))}
                 </div>
                 <p className="text-[13px] font-medium text-slate-400">
                   Active on <span className="text-slate-900 font-bold">450+</span> global storefronts
                 </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 flex justify-center gap-8">
           <a href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Documentation</a>
           <a href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Support</a>
           <a href="#" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Privacy</a>
        </div>
      </div>
    </main>
  );
}
