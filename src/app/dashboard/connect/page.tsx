"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

export default function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-20">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl">
        <Link 
          href="/dashboard" 
          className="group mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-all hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <Card className="border-slate-200/60 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-6 pb-10 text-center pt-12 bg-slate-50/50 border-b border-slate-100">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
               <img src="/shopify/glyph.svg" alt="Shopify" className="h-12 w-12 object-contain" />
            </div>
            <div className="space-y-2 px-6">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Connect Shopify</CardTitle>
              <CardDescription className="text-[17px] font-medium text-slate-500">
                Sync your catalog to train ShopSense AI and start converting shoppers.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-10 pb-12 pt-10">
            <form 
              action="/api/shopify/install" 
              method="GET" 
              className="space-y-8"
              onSubmit={() => setIsLoading(true)}
            >
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1" htmlFor="shop">
                  Store Domain
                </label>
                <div className="relative group">
                  <Input
                    id="shop"
                    name="shop"
                    required
                    disabled={isLoading}
                    placeholder="your-brand-name.myshopify.com"
                    className="h-14 border-slate-200 bg-white px-5 text-lg font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-2xl"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-950/[0.05] pointer-events-none" />
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Install App & Connect"
                )}
              </Button>
            </form>

            <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
              <div className="flex gap-4">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <span className="text-xs font-black italic">!</span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-500 font-medium">
                  Find your domain in the Shopify Admin URL. It usually looks like 
                  <code className="mx-1.5 rounded-md bg-blue-50 text-blue-700 px-1.5 py-0.5 font-bold font-mono text-[12px] border border-blue-100/50">your-store.myshopify.com</code>.
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-center border-t border-slate-100 pt-8">
              <a 
                href="https://help.shopify.com/en/manual/intro-to-shopify/initial-setup" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 transition-all hover:text-blue-600"
              >
                Learn more about Shopify settings
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
