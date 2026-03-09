import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";

export default async function BillingPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const storeId = searchParams.storeId || "demo-store";
  const subscription = await prisma.billingSubscription.findUnique({ where: { storeId } });

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Dashboard" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Onboarding" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Inbox" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Settings" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Billing", active: true }
      ]}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Billing"
          subtitle="Subscription lifecycle and trial status."
          action={<Link href={`/dashboard?storeId=${storeId}`} className="text-sm text-primary underline">Back</Link>}
        />

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Use admin billing API for upgrades and downgrades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tier:</span>
              <Badge>{subscription?.tier || "STARTER"}</Badge>
            </div>
            <p><span className="text-muted-foreground">Active:</span> {subscription?.active ? "Yes" : "No"}</p>
            <p><span className="text-muted-foreground">Trial ends:</span> {subscription?.trialEndsAt?.toISOString() || "N/A"}</p>
            <p><span className="text-muted-foreground">External charge ID:</span> {subscription?.externalChargeId || "N/A"}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
