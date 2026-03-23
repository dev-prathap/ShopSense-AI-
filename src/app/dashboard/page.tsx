import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnalyticsSnapshot } from "@/lib/analytics/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { EmptyState } from "@/components/app/EmptyState";

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
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights", active: true },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/team?storeId=${storeId}`, label: "Team" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Performance Insights"
          subtitle="Real-time conversion metrics and AI training health."
          action={
            <Link 
              href={`/dashboard/settings?storeId=${storeId}`} 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all"
            >
              Configure AI
            </Link>
          }
        />

        <section className="grid gap-6 md:grid-cols-3">
          <KpiCard label="Conversations" value={data.conversations} trend={{ value: "12%", positive: true }} />
          <KpiCard label="AI Attributed Revenue" value={`$${data.attributedRevenue.toFixed(2)}`} trend={{ value: "8%", positive: true }} />
          <KpiCard label="Recovery Acceptance" value={`${(data.recoveryAcceptanceRate * 100).toFixed(1)}%`} trend={{ value: "2.4%", positive: true }} />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <KpiCard label="Catalog Products" value={data.sync.products} note={`In stock ${data.sync.inStockProducts} • Variants ${data.sync.variants}`} />
          <KpiCard label="Knowledge Status" value={`${data.sync.knowledgePublished}/${data.sync.knowledgeSourcesTotal}`} note={`Vector chunks ${data.sync.knowledgeChunks}`} />
          <KpiCard label="Orders Cache" value={data.sync.ordersCached} note="Used for order-status responses" />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Sync Health</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">Live catalog and knowledge base health.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-bold text-slate-500">Last Catalog Update</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{data.sync.lastCatalogUpdateAt ? new Date(data.sync.lastCatalogUpdateAt).toLocaleString() : "Not synced"}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-bold text-slate-500">Last Knowledge Fetch</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{data.sync.lastKnowledgeFetchAt ? new Date(data.sync.lastKnowledgeFetchAt).toLocaleString() : "Not fetched"}</span>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-bold text-slate-500">Last Knowledge Publish</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{data.sync.lastKnowledgePublishedAt ? new Date(data.sync.lastKnowledgePublishedAt).toLocaleString() : "Not published"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Top Shopper Intents</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">Buying signals detected in conversations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {data.topIntents.length === 0 ? (
                <div className="p-12">
                   <EmptyState title="No intent data yet" subtitle="Insights appear as shoppers interact with your AI." />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.topIntents.map((row) => (
                    <div key={row.intent} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-bold text-slate-700">{row.intent}</span>
                      <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{row.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
