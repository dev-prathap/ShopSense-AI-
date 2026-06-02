import Link from "next/link";
import { validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/app/billing/SubscribeButton";
import { Check, Zap, Rocket, Crown, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getManagedPricingUrl } from "@/lib/shopify/managed-pricing";

type PlanTier = "STARTER" | "GROWTH" | "PRO";

export default async function BillingPage({ searchParams }: { searchParams: { storeId?: string; success?: string; canceled?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { shopDomain: true, billingSubscription: true }
  });

  if (!store) {
    return null;
  }

  const subscription = store.billingSubscription;
  const managedPricingUrl = getManagedPricingUrl(store.shopDomain);
  const currentTier = subscription?.tier || null;

  const plans: Array<{
    tier: PlanTier;
    name: string;
    price: string;
    description: string;
    icon: JSX.Element;
    highlighted: boolean;
    features: string[];
  }> = [
    {
      tier: "STARTER",
      name: "Starter",
      price: "$49",
      description: "For stores getting started with AI-assisted selling. Everything you need to turn browsers into buyers.",
      icon: <Zap className="h-5 w-5" />,
      highlighted: false,
      features: [
        "AI sales assistant on storefront",
        "Product Q&A from live catalog",
        "Up to 500 conversations / month",
        "Order tracking & handoff",
        "Basic analytics dashboard"
      ]
    },
    {
      tier: "GROWTH",
      name: "Growth",
      price: "$79",
      description: "For stores scaling traffic. Deeper insights, higher conversation cap, and cart recovery built-in.",
      icon: <Rocket className="h-5 w-5" />,
      highlighted: true,
      features: [
        "Everything in Starter",
        "Up to 2,500 conversations / month",
        "Cart recovery discount offers",
        "Knowledge base (FAQ / shipping / returns)",
        "Advanced analytics with revenue attribution"
      ]
    },
    {
      tier: "PRO",
      name: "Pro",
      price: "$129",
      description: "For high-volume stores. Unlimited conversations, priority support, and premium AI features.",
      icon: <Crown className="h-5 w-5" />,
      highlighted: false,
      features: [
        "Everything in Growth",
        "Unlimited conversations",
        "Priority support (under 4h response)",
        "Custom AI persona tuning",
        "Merchant handoff via webhook / Slack"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_40%,#ffffff_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {searchParams.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800">
            <p className="text-sm font-bold">Subscription active</p>
            <p className="text-xs font-medium opacity-80">Your plan is now active. It can take a few seconds to reflect here.</p>
          </div>
        )}

        {searchParams.canceled && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-700">
            <p className="text-sm font-bold">Plan change canceled</p>
            <p className="text-xs font-medium opacity-80">No charge was made. You can pick a plan anytime.</p>
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl md:p-10">
          <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-blue-100 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Plans</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Plan & Billing</h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500 md:text-base">
                All charges are processed by Shopify and appear on your regular Shopify bill. Upgrade, downgrade, or cancel anytime.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
                {currentTier || "No Plan"}
              </Badge>
              <Link
                href={`/dashboard?storeId=${storeId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-900"
              >
                Back to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier && subscription?.active;
            const label = isCurrent ? "Current Plan" : currentTier ? "Switch Plan" : "Choose Plan";
            return (
              <article
                key={plan.tier}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  plan.highlighted ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200",
                  isCurrent && "border-emerald-400 ring-2 ring-emerald-100"
                )}
              >
                {plan.highlighted && !isCurrent && (
                  <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                    Active
                  </div>
                )}

                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      plan.highlighted ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{plan.tier}</p>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">{plan.name}</h2>
                  </div>
                </div>

                <p className="mb-5 text-sm font-medium leading-relaxed text-slate-500">{plan.description}</p>

                <div className="mb-6 flex items-end gap-1">
                  <span className="text-5xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                  <span className="pb-2 text-base font-bold text-slate-400">/month</span>
                </div>

                <div className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <p className="text-[13px] font-medium leading-snug text-slate-600">{feature}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <SubscribeButton
                    managedPricingUrl={managedPricingUrl}
                    label={label}
                    disabled={isCurrent}
                    variant={plan.highlighted ? "default" : "outline"}
                    className={cn(
                      "h-12 rounded-2xl text-[14px] font-black",
                      plan.highlighted ? "bg-slate-900 text-white hover:bg-black" : "border-slate-200 text-slate-700",
                      isCurrent && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    )}
                  />
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Current Tier</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{currentTier || "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Subscription Status</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight", subscription?.active ? "text-emerald-600" : "text-rose-600")}>
              {subscription?.active ? "ACTIVE" : "INACTIVE"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Trial Ends</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-900 bg-slate-950 px-6 py-5 text-center text-slate-300">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Billing by Shopify
          </div>
          <p className="text-sm font-semibold">Billing is managed by Shopify. Charges appear on your regular Shopify invoice.</p>
        </section>
      </div>
    </main>
  );
}
