import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default async function InboxPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const storeId = searchParams.storeId || "demo-store";

  const conversations = await prisma.conversation.findMany({
    where: { storeId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 50
  });

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Dashboard" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Onboarding" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Inbox", active: true },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Settings" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Billing" }
      ]}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Conversation Inbox"
          subtitle="Review handoffs and active shopper conversations."
          action={<Link href={`/dashboard?storeId=${storeId}`} className="text-sm text-primary underline">Back to Dashboard</Link>}
        />

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Open Threads</CardTitle>
            <CardDescription>{conversations.length} conversations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.length === 0 ? (
              <EmptyState title="No conversations yet" subtitle="When shoppers chat with the widget, conversations will appear here." />
            ) : (
              conversations.map((c) => (
                <div key={c.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Visitor: {c.visitorId}</div>
                    <Badge variant={c.status === "HANDOFF_REQUESTED" ? "destructive" : c.status === "RESOLVED" ? "secondary" : "outline"}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.messages[0]?.content || "No messages yet"}</p>
                  {c.handoffReason ? <p className="mt-2 text-xs">Handoff reason: {c.handoffReason}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
