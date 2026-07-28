import Link from "next/link";
import { redirect } from "next/navigation";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { checkStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { KnowledgeSetup } from "@/components/onboarding/KnowledgeSetup";
import { computeStoreOnboardingProgress } from "@/lib/onboarding/progress";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { SyncButton } from "@/components/app/SyncButton";
import { ActionPanel } from "@/components/app/ActionPanel";
import { StatusPill } from "@/components/app/StatusPill";
import { OnboardingState } from "@/lib/ui/contracts";

/**
 * Reachable as a plain POST endpoint — the membership lookup in the page
 * component guards the render, not this submission, and storeId arrives from
 * the caller.
 */
async function completeQuickOnboarding(formData: FormData) {
  "use server";

  const storeId = String(formData.get("storeId") || "");
  if (!storeId) {
    redirect("/dashboard/connect");
  }
  if (!(await checkStoreAccess(storeId))) {
    redirect("/dashboard/connect");
  }

  const [progress, publishedCount] = await Promise.all([
    computeStoreOnboardingProgress(storeId),
    prisma.knowledgeSource.count({
      where: { storeId, status: "PUBLISHED" }
    })
  ]);
  const knowledgeReady = Boolean(progress?.knowledgeReady) || publishedCount > 0;
  if (!knowledgeReady) {
    redirect(`/dashboard/onboarding?storeId=${storeId}&error=knowledge_not_ready`);
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      onboardingStep: 7,
      onboardingCompletedAt: new Date(),
      knowledgeReadyAt: knowledgeReady ? new Date() : null
    }
  });

  redirect(`/dashboard?storeId=${storeId}`);
}

export default async function OnboardingPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const session = await readAppSessionFromServerComponent();
  if (!session) {
    redirect("/login");
  }

  const memberships = await prisma.appUserStoreMembership.findMany({
    where: { appUserId: session.sub },
    include: { store: true },
    take: 1
  });

  const storeId = searchParams.storeId || memberships[0]?.storeId;
  if (!storeId) {
    redirect("/dashboard/connect");
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    redirect("/dashboard/connect");
  }

  const [progress, publishedCount] = await Promise.all([
    computeStoreOnboardingProgress(storeId),
    prisma.knowledgeSource.count({
      where: { storeId, status: "PUBLISHED" }
    })
  ]);
  const connected = Boolean(store.accessToken);
  const ready = Boolean(progress?.knowledgeReady) || publishedCount > 0;
  const lastTrained = await prisma.knowledgeSource.aggregate({
    where: { storeId },
    _max: { publishedAt: true }
  });
  const onboardingState: OnboardingState = {
    connected,
    knowledgeStatus: ready ? "ready" : "idle",
    publishedSources: publishedCount,
    lastTrainedAt: lastTrained._max.publishedAt ? lastTrained._max.publishedAt.toISOString() : null,
    canComplete: connected && ready
  };

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge", active: true },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Knowledge Center"
          subtitle="Manage store intelligence, training sources, and AI memory."
          action={<StatusPill label={onboardingState.canComplete ? "Fully Trained" : "Training Required"} tone={onboardingState.canComplete ? "success" : "warning"} />}
        />

        <ActionPanel
          title="Core Connectivity"
          description="Your Shopify connection powers real-time catalog and order intelligence."
        >
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Connected Store</p>
              <p className="text-sm font-bold text-slate-900">{store.shopDomain}</p>
            </div>
            <div className="flex gap-2">
              <SyncButton
                storeId={storeId}
                className="rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-10 px-4 text-[13px]"
              />
            </div>
          </div>
        </ActionPanel>

        <KnowledgeSetup storeId={storeId} />

        <ActionPanel
          title="Launch Control"
          description="Finalize your setup by publishing the latest intelligence to your storefront."
        >
          <div className="flex flex-wrap items-center gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <form action={completeQuickOnboarding}>
              <input type="hidden" name="storeId" value={storeId} />
              <Button 
                type="submit" 
                disabled={!onboardingState.canComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Enter Dashboard
              </Button>
            </form>
            <div className="space-y-1">
              <p className="text-[12px] font-bold text-slate-700">
                {onboardingState.publishedSources} Knowledge Sources published
              </p>
              {onboardingState.lastTrainedAt ? (
                <p className="text-[11px] font-medium text-slate-400">
                  Last updated {new Date(onboardingState.lastTrainedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex gap-6 text-[13px] font-bold">
            <Link href={`/dashboard/settings?storeId=${storeId}`} className="text-slate-400 hover:text-blue-600 transition-colors">
              Advanced Settings
            </Link>
            <Link href={`/widget?storeId=${storeId}`} className="text-slate-400 hover:text-blue-600 transition-colors" target="_blank">
              Preview Widget
            </Link>
          </div>
        </ActionPanel>
      </div>
    </AppShell>
  );
}
