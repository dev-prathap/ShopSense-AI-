import Link from "next/link";
import { validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { SubscribeButton } from "@/components/app/billing/SubscribeButton";
import { Check, X, ArrowRight, Zap, Search, LifeBuoy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BillingPage({ searchParams }: { searchParams: { storeId?: string, success?: string, canceled?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  const subscription = await prisma.billingSubscription.findUnique({ where: { storeId } });

  const products = [
    {
      id: "shopbot",
      name: "Neryn Bot AI",
      tag: "Sales Bot",
      description: "LLM-powered product discovery and cart assistant embedded on your storefront.",
      price: "$100",
      priceNote: "/month",
      subNote: "Flat fee. No usage caps.",
      features: [
        "Shopify, WooCommerce & BigCommerce",
        "Live product catalog sync",
        "Intent-based recommendations",
        "In-chat cart add",
        "Brand tone customisation"
      ],
      cta: subscription?.active ? "Active" : "Start Free Trial",
      popular: true,
      icon: <Zap className="h-5 w-5 text-indigo-500" />,
      color: "border-indigo-500 ring-indigo-500/20 ring-1"
    },
    {
      id: "searchsync",
      name: "SearchSync",
      tag: "Visibility",
      description: "Get found on Google and inside AI answers — ChatGPT, Perplexity, Google AI Overviews.",
      price: "Custom",
      priceNote: "",
      subNote: "Scoped per store size and catalog depth.",
      features: [
        "Technical SEO audit & fixes",
        "Product schema & structured data",
        "AI search optimisation (GEO/AEO)",
        "Brand citation strategy for LLMs",
        "Monthly visibility reporting"
      ],
      cta: "Contact Sales",
      popular: false,
      icon: <Search className="h-5 w-5 text-blue-500" />,
      color: "border-slate-200"
    },
    {
      id: "supportdesk",
      name: "SupportDesk AI",
      tag: "Support",
      description: "An AI-first support bot that resolves tickets, logs issues, and escalates — plugged into your helpdesk.",
      price: "Custom",
      priceNote: "",
      subNote: "Tiered by monthly ticket volume.",
      features: [
        "Zendesk, Gorgias & Freshdesk integration",
        "Auto-resolves returns, FAQs, order status",
        "Smart escalation to human agents",
        "Ticket logging & tagging",
        "CSAT tracking dashboard"
      ],
      cta: "Contact Sales",
      popular: false,
      icon: <LifeBuoy className="h-5 w-5 text-emerald-500" />,
      color: "border-slate-200"
    }
  ];

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan", active: true }
      ]}
    >
      <div className="flex flex-col gap-8 pb-12">
        {searchParams.success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                </div>
                <div>
                    <p className="font-bold text-sm">Payment Successful!</p>
                    <p className="text-xs opacity-80">Your subscription has been updated. It may take a few moments to reflect below.</p>
                </div>
            </div>
        )}

        {searchParams.canceled && (
            <div className="bg-slate-100 border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                <div className="bg-slate-400 text-white rounded-full p-1">
                    <X className="h-4 w-4" />
                </div>
                <div>
                    <p className="font-bold text-sm">Checkout Canceled</p>
                    <p className="text-xs opacity-80">No charges were made. Feel free to try again when you're ready.</p>
                </div>
            </div>
        )}

        <PageHeader
          title="Plan & Billing"
          subtitle="Manage your AI product stack and subscription lifecycle."
          action={
            <div className="flex items-center gap-3">
                 <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm border-indigo-100 text-indigo-700 font-bold uppercase tracking-tighter text-[10px]">
                    {subscription?.tier || "STARTER"} Plan
                </Badge>
                <Link href={`/dashboard?storeId=${storeId}`} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                    Back to Core
                </Link>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className={cn("relative flex flex-col h-full bg-white transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden", product.color)}>
              {product.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {product.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{product.tag}</span>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{product.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed min-h-[40px]">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">{product.price}</span>
                    <span className="text-sm font-semibold text-slate-400 lowercase">{product.priceNote}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">{product.subNote}</p>
                </div>

                <div className="space-y-3.5 mb-8">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex gap-3 text-[13px] font-medium text-slate-600 leading-tight">
                      <div className="mt-0.5 rounded-full bg-emerald-50 text-emerald-600 p-0.5">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                   <SubscribeButton 
                    storeId={storeId}
                    productId={product.id === "shopbot" ? "prod_8XT58mOgy3zGPM66cZm0E" : "custom"}
                    label={product.cta}
                    variant={product.popular ? "default" : "outline"}
                    className={cn(
                        product.popular && "bg-slate-900 hover:bg-black text-white shadow-lg shadow-indigo-200"
                    )}
                   />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-200" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Market Comparison</h3>
                <div className="h-px flex-1 bg-slate-200" />
            </div>
            
            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Platform/Tool</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Monthly Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Intelligence</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Multi-Store</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Product Focus</th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] font-medium">
                            <tr className="border-t border-slate-100 bg-indigo-50/20">
                                <td className="px-6 py-5 font-bold text-indigo-600">Neryn Bot AI ✦</td>
                                <td className="px-6 py-5 text-center font-bold text-slate-900">$100/mo</td>
                                <td className="px-6 py-5 text-center"><Badge className="bg-emerald-100 text-emerald-700 border-none">GPT-4o Native</Badge></td>
                                <td className="px-6 py-5 text-center text-emerald-500 font-bold underline decoration-2 underline-offset-4">Included</td>
                                <td className="px-6 py-5 text-center text-emerald-500 font-bold underline decoration-2 underline-offset-4">Deep Context</td>
                            </tr>
                            <tr className="border-t border-slate-100">
                                <td className="px-6 py-4 text-slate-600">Tidio / Lyro AI</td>
                                <td className="px-6 py-4 text-center text-slate-500">from $29/mo</td>
                                <td className="px-6 py-4 text-center text-amber-500">Hybrid</td>
                                <td className="px-6 py-4 text-center text-emerald-500 font-bold">Yes</td>
                                <td className="px-6 py-4 text-center text-rose-500">Support-First</td>
                            </tr>
                            <tr className="border-t border-slate-100">
                                <td className="px-6 py-4 text-slate-600">Octane AI</td>
                                <td className="px-6 py-4 text-center text-slate-500">from $50/mo</td>
                                <td className="px-6 py-4 text-center text-rose-500">Quiz-Based</td>
                                <td className="px-6 py-4 text-center text-rose-500">Shopify Only</td>
                                <td className="px-6 py-4 text-center text-amber-500">Partial</td>
                            </tr>
                            <tr className="border-t border-slate-100">
                                <td className="px-6 py-4 text-slate-600">Gobot</td>
                                <td className="px-6 py-4 text-center text-slate-500">$99–$299/mo</td>
                                <td className="px-6 py-4 text-center text-rose-500">Flow-Based</td>
                                <td className="px-6 py-4 text-center text-rose-500">Shopify Only</td>
                                <td className="px-6 py-4 text-center text-amber-500">Partial</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
            <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Competitor data sourced from public pricing pages 2025.
            </p>
        </section>

        <section className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 block">Common Questions</span>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">Subscription & Technical FAQ</h3>
                    <p className="text-sm text-slate-500 mt-2">Everything you need to know about the Neryn product stack.</p>
                </div>
                <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Does it work with my existing theme?
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Yes. The widget is injected as a lightweight overlay — no theme edits, no layout conflicts.</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            What if my catalog updates daily?
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Catalog data is re-synced automatically via webhooks. Pricing and stock are always current.</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Can it handle 1,000+ products?
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Yes. The bot selects relevant product subsets per query — it doesn't load everything at once.</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            Is there a free trial?
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Yes — 14 days, no credit card required. Full access to all features from day one.</p>
                    </div>
                </div>
            </div>
        </section>

        <Card className="bg-slate-950 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[120px] rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full -ml-20 -mb-20" />
            <CardHeader className="relative z-10 text-center pt-10 pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/40">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter">Current Subscription Security</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Verified status of your store's cloud license.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 max-w-2xl mx-auto px-6 pb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier</p>
                        <p className="text-lg font-black text-indigo-400">{subscription?.tier || "STARTER"}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                        <p className={cn("text-lg font-black", subscription?.active ? "text-emerald-400" : "text-rose-400")}>
                            {subscription?.active ? "ACTIVE" : "INACTIVE"}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trial Validity</p>
                        <p className="text-lg font-black text-white">
                            {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "EXPIRED"}
                        </p>
                    </div>
                </div>
                {subscription?.externalChargeId && (
                    <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shopify Charge Reference</span>
                        <code className="text-xs font-mono text-indigo-300">{subscription.externalChargeId}</code>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
