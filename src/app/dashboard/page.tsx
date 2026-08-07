import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnalyticsSnapshot } from "@/lib/analytics/service";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { EmptyState } from "@/components/app/EmptyState";
import { WidgetEmbedReminder } from "@/components/app/WidgetEmbedReminder";

function formatWhen(value: Date | null, fallback: string) {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function fetchDashboardData(storeId: string) {
  try {
    return await getAnalyticsSnapshot(storeId);
  } catch {
    return {
      conversations: 0,
      attributedRevenue: 0,
      convertedConversations: 0,
      recoveryAcceptanceRate: 0,
      topIntents: [] as Array<{ intent: string; count: number }>,
      sync: {
        products: 0,
        inStockProducts: 0,
        variants: 0,
        ordersCached: 0,
        lastCatalogUpdateAt: null as Date | null,
        knowledgeSourcesTotal: 0,
        knowledgePublished: 0,
        knowledgeChunks: 0,
        lastKnowledgeFetchAt: null as Date | null,
        lastKnowledgePublishedAt: null as Date | null
      }
    };
  }
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { storeId?: string };
}) {
  const session = await readAppSessionFromServerComponent();
  if (!session) {
    redirect("/login");
  }

  const memberships = await prisma.appUserStoreMembership.findMany({
    where: { appUserId: session.sub },
    include: {
      store: {
        select: {
          id: true,
          shopDomain: true,
          onboardingCompletedAt: true,
          billingSubscription: {
            select: { active: true }
          }
        }
      }
    },
    take: 1
  });

  if (memberships.length === 0) {
    redirect("/onboarding/welcome");
  }

  const mappedStoreId = memberships[0].store.id;
  const requestedStoreId = searchParams.storeId || mappedStoreId;
  const currentMembership = memberships.find(m => m.store.id === requestedStoreId);
  
  if (!currentMembership) {
    redirect(`/dashboard?storeId=${mappedStoreId}`);
  }

  const storeId = requestedStoreId;
  const storeData = currentMembership.store;

  // Strict Enforce: Must have completed onboarding AND have an active subscription
  if (!storeData.onboardingCompletedAt || !storeData.billingSubscription?.active) {
    redirect(`/dashboard/wizard?storeId=${storeId}`);
  }

  const data = await fetchDashboardData(storeId);

  return (
    <AppShell
      storeId={storeId}
      shopDomain={storeData.shopDomain}
      user={{ name: session.name, email: session.email }}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights", active: true },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/team?storeId=${storeId}`, label: "Team" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-7">
        <WidgetEmbedReminder shopDomain={storeData.shopDomain} />

        <PageHeader
          title="Performance Insights"
          subtitle="Real-time conversion metrics and AI training health."
          action={
            <Link
              href={`/dashboard/settings?storeId=${storeId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black"
            >
              Configure AI
            </Link>
          }
        />

        <section className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            AI Performance
          </p>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <KpiCard hero label="Conversations" value={data.conversations.toLocaleString()} />
            <KpiCard hero label="AI Attributed Revenue" value={`$${data.attributedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <KpiCard hero label="Recovery Acceptance" value={`${(data.recoveryAcceptanceRate * 100).toFixed(1)}%`} />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Data Health
          </p>
          <div className="grid gap-3.5 sm:grid-cols-3">
            <KpiCard label="Catalog Products" value={data.sync.products.toLocaleString()} note={`In stock ${data.sync.inStockProducts.toLocaleString()} · Variants ${data.sync.variants.toLocaleString()}`} />
            <KpiCard label="Knowledge Status" value={`${data.sync.knowledgePublished}/${data.sync.knowledgeSourcesTotal}`} note={`Vector chunks ${data.sync.knowledgeChunks.toLocaleString()}`} />
            <KpiCard label="Orders Cache" value={data.sync.ordersCached.toLocaleString()} note="Used for order-status responses" />
          </div>
        </section>

        <div className="grid gap-3.5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <h3 className="text-[15px] font-bold text-slate-900">Sync Health</h3>
            <p className="mb-4 text-[12.5px] font-medium text-slate-400">Live catalog and knowledge base health.</p>
            <div className="space-y-2.5">
              {[
                { label: "Last Catalog Update", value: formatWhen(data.sync.lastCatalogUpdateAt, "Not synced") },
                { label: "Last Knowledge Fetch", value: formatWhen(data.sync.lastKnowledgeFetchAt, "Not fetched") },
                { label: "Last Knowledge Publish", value: formatWhen(data.sync.lastKnowledgePublishedAt, "Not published") },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-slate-500">{row.label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] backdrop-blur-xl">
            <h3 className="text-[15px] font-bold text-slate-900">Top Shopper Intents</h3>
            <p className="mb-4 text-[12.5px] font-medium text-slate-400">Buying signals detected in conversations.</p>
            {data.topIntents.length === 0 ? (
              <EmptyState title="No intent data yet" subtitle="Insights appear as shoppers interact with your AI." />
            ) : (
              <div className="space-y-2.5">
                {data.topIntents.map((row) => (
                  <div key={row.intent} className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-600">{row.intent}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[12px] font-bold text-blue-600">{row.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
