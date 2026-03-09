import Link from "next/link";
import { redirect } from "next/navigation";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { KnowledgeSetup } from "@/components/onboarding/KnowledgeSetup";
import { computeStoreOnboardingProgress } from "@/lib/onboarding/progress";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { ActionPanel } from "@/components/app/ActionPanel";
import { StatusPill } from "@/components/app/StatusPill";
import { OnboardingState } from "@/lib/ui/contracts";

async function completeQuickOnboarding(formData: FormData) {
  "use server";

  const storeId = String(formData.get("storeId") || "");
  if (!storeId) {
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
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Onboarding", active: true },
        { href: `/dashboard?storeId=${storeId}`, label: "Dashboard" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Inbox" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Settings" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Billing" }
      ]}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="2-Minute Guided Setup"
          subtitle="Connect Shopify, train AI knowledge, and launch."
          action={<StatusPill label={onboardingState.canComplete ? "Ready to complete" : "Setup in progress"} tone={onboardingState.canComplete ? "success" : "warning"} />}
        />

        <ActionPanel
          title="1. Shopify Connection"
          description="We use your connected Shopify store to power catalog and order intelligence."
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p>Store: {store.shopDomain}</p>
              <p>Status: {connected ? "Connected" : "Not connected"}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/api/shopify/install?shop=${encodeURIComponent(store.shopDomain)}`}>
                <Button variant="outline">Reconnect Shopify</Button>
              </a>
              <Link href="/dashboard/connect">
                <Button variant="ghost">Use another store</Button>
              </Link>
            </div>
          </div>
        </ActionPanel>

        <KnowledgeSetup storeId={storeId} />

        <ActionPanel
          title="3. Go Live"
          description="When both checks are ready, complete onboarding and enter dashboard."
        >
          <div className="flex flex-wrap items-center gap-3">
            <form action={completeQuickOnboarding}>
              <input type="hidden" name="storeId" value={storeId} />
              <Button type="submit" disabled={!onboardingState.canComplete}>
                Go to Dashboard
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              Published sources: {onboardingState.publishedSources}
              {onboardingState.lastTrainedAt ? ` • Last trained ${new Date(onboardingState.lastTrainedAt).toLocaleString()}` : ""}
            </p>
          </div>
          <div className="mt-2 flex gap-3 text-sm">
            <Link href={`/dashboard/settings?storeId=${storeId}`} className="text-muted-foreground underline">
              Advanced settings (optional)
            </Link>
            <Link href={`/widget?storeId=${storeId}`} className="text-muted-foreground underline">
              Test widget
            </Link>
          </div>
        </ActionPanel>
      </div>
    </AppShell>
  );
}
