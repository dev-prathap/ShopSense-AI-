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
          onboardingCompletedAt: true
        }
      }
    },
    take: 1
  });

  if (memberships.length === 0) {
    redirect("/dashboard/connect");
  }

  const mappedStoreId = memberships[0].store.id;
  const storeId = searchParams.storeId || mappedStoreId;
  if (!memberships[0].store.onboardingCompletedAt) {
    redirect(`/dashboard/onboarding?storeId=${storeId}`);
  }

  const data = await fetchDashboardData(storeId);

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Dashboard", active: true },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Onboarding" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Inbox" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Settings" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Billing" }
      ]}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Revenue & Sync Dashboard"
          subtitle="Live conversion performance and store sync health."
          action={
            <Link href={`/dashboard/settings?storeId=${storeId}`} className={cn(buttonVariants())}>
              Configure AI
            </Link>
          }
        />

        <section className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Conversations" value={data.conversations} />
          <KpiCard label="AI Attributed Revenue" value={`$${data.attributedRevenue.toFixed(2)}`} />
          <KpiCard label="Recovery Acceptance" value={`${(data.recoveryAcceptanceRate * 100).toFixed(1)}%`} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Catalog Products Synced" value={data.sync.products} note={`In stock ${data.sync.inStockProducts} • Variants ${data.sync.variants}`} />
          <KpiCard label="Knowledge Published" value={`${data.sync.knowledgePublished}/${data.sync.knowledgeSourcesTotal}`} note={`Vector chunks ${data.sync.knowledgeChunks}`} />
          <KpiCard label="Orders Cache" value={data.sync.ordersCached} note="Used for order-status responses" />
        </section>

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Sync Health</CardTitle>
            <CardDescription>Latest sync timestamps for catalog and knowledge base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Last Catalog Update</span>
              <span className="font-medium">{data.sync.lastCatalogUpdateAt ? new Date(data.sync.lastCatalogUpdateAt).toLocaleString() : "Not synced yet"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Last Knowledge Fetch</span>
              <span className="font-medium">{data.sync.lastKnowledgeFetchAt ? new Date(data.sync.lastKnowledgeFetchAt).toLocaleString() : "Not fetched yet"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>Last Knowledge Publish</span>
              <span className="font-medium">{data.sync.lastKnowledgePublishedAt ? new Date(data.sync.lastKnowledgePublishedAt).toLocaleString() : "Not published yet"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Top Intents</CardTitle>
            <CardDescription>Most frequent shopper questions and buying signals.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topIntents.length === 0 ? (
              <EmptyState title="No conversation insights yet" subtitle="Once visitors chat with AI, intent insights will appear here." />
            ) : (
              <ul className="space-y-2 text-sm">
                {data.topIntents.map((row) => (
                  <li key={row.intent} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span>{row.intent}</span>
                    <span className="font-medium">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
