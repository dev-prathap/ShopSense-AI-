import Link from "next/link";
import { validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/app/billing/SubscribeButton";
import { Check, X, Zap, Search, LifeBuoy, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BillingPage({ searchParams }: { searchParams: { storeId?: string; success?: string; canceled?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  const subscription = await prisma.billingSubscription.findUnique({ where: { storeId } });

  const planProductIds = {
    assist: process.env.CREEM_PRODUCT_ID_ASSIST || process.env.CREEM_PRODUCT_ID_SHOPBOT || "custom",
    manage: "custom",
    desk: "custom"
  } as const;

  const plans = [
    {
      id: "assist",
      name: "Neryn Assist",
      tag: "Sales Assistant",
      price: "$49",
      period: "/month",
      description: "Your store's always-on sales rep. It chats, recommends the right product, and gets it into the cart.",
      subNote: "Flat rate. No usage limits. Cancel anytime.",
      cta: subscription?.active ? "Active" : "Activate Assist",
      highlighted: true,
      icon: <Zap className="h-5 w-5" />,
      features: [
        "One-click install on Shopify, WooCommerce or BigCommerce",
        "Reads what shoppers mean, not just what they type",
        "Always in sync with your live prices, stock and variants",
        "Adds products to cart inside the chat, no page reload",
        "Speaks in your brand's tone, not a generic bot voice"
      ]
    },
    {
      id: "manage",
      name: "Neryn Manage",
      tag: "Store Manager",
      price: "Custom",
      period: "",
      description: "Everything in Assist, plus a clear view of what shoppers are asking, what's running low, and what's converting.",
      subNote: "Tailored pricing based on store size and operations needs.",
      cta: "Scale My Store",
      highlighted: false,
      icon: <Search className="h-5 w-5" />,
      features: [
        "Everything in Neryn Assist",
        "Low stock alerts before items get recommended and disappoint",
        "Live feed of every question shoppers are typing right now",
        "Spots catalog gaps from questions that got no match",
        "Conversion dashboard showing chat-to-cart rate and AOV impact",
        "Weekly summary in your inbox every Monday morning"
      ]
    },
    {
      id: "desk",
      name: "Neryn Desk",
      tag: "Customer Support",
      price: "Custom",
      period: "",
      description: "Takes care of the repetitive support tickets so your team only deals with the ones that actually need them.",
      subNote: "Pricing depends on ticket volume and support workflow complexity.",
      cta: "Automate Support Now",
      highlighted: false,
      icon: <LifeBuoy className="h-5 w-5" />,
      features: [
        "Auto-resolves returns, order status, refund questions and FAQs",
        "Logs and tags tickets straight into Zendesk or Gorgias",
        "Hands off to your team when a ticket needs a real person",
        "Slack digest every morning with ticket count and resolution rate",
        "Customers rate the resolution automatically after each close"
      ]
    }
  ] as const;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_40%,#ffffff_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {searchParams.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-800">
            <p className="text-sm font-bold">Payment successful</p>
            <p className="text-xs font-medium opacity-80">Your plan was updated successfully.</p>
          </div>
        )}

        {searchParams.canceled && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-700">
            <p className="text-sm font-bold">Checkout canceled</p>
            <p className="text-xs font-medium opacity-80">No charge was made. You can continue anytime.</p>
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl md:p-10">
          <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-blue-100 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Plans</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Plan & Billing</h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500 md:text-base">
                Pick the right Neryn plan for your growth stage. Start with Assist and expand when operations scale.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
                {subscription?.tier || "STARTER"} Plan
              </Badge>
              <Link
                href={`/dashboard?storeId=${storeId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-slate-900"
              >
                Back to Core <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                plan.highlighted ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                  Most Popular
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{plan.tag}</p>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">{plan.name}</h2>
                </div>
              </div>

              <p className="mb-5 text-sm font-medium leading-relaxed text-slate-500">{plan.description}</p>

              <div className="mb-5 flex items-end gap-1">
                <span className="text-5xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                {plan.period ? <span className="pb-2 text-base font-bold text-slate-400">{plan.period}</span> : null}
              </div>

              <p className="mb-6 text-xs font-semibold text-slate-400">{plan.subNote}</p>

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
                  storeId={storeId}
                  productId={planProductIds[plan.id as keyof typeof planProductIds]}
                  label={plan.cta}
                  variant={plan.highlighted ? "default" : "outline"}
                  className={cn(
                    "h-12 rounded-2xl text-[14px] font-black",
                    plan.highlighted ? "bg-slate-900 text-white hover:bg-black" : "border-slate-200 text-slate-700"
                  )}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Current Tier</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{subscription?.tier || "STARTER"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Subscription Status</p>
            <p className={cn("mt-2 text-2xl font-black tracking-tight", subscription?.active ? "text-emerald-600" : "text-rose-600")}>{subscription?.active ? "ACTIVE" : "INACTIVE"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Trial Ends</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "N/A"}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-900 bg-slate-950 px-6 py-5 text-center text-slate-300">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Billing
          </div>
          <p className="text-sm font-semibold">Payments are processed via Creem. Upgrade and cancel anytime from this page.</p>
        </section>
      </div>
    </main>
  );
}
