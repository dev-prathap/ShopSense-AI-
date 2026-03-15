import { cn } from "@/lib/utils";
import Link from "next/link";
import { validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default async function InboxPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);

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
        { href: `/dashboard?storeId=${storeId}`, label: "Insights" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations", active: true },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration" },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Conversations"
          subtitle="Real-time interactions between your AI agent and shoppers."
          action={<Link href={`/dashboard?storeId=${storeId}`} className="text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors">Back to Insights</Link>}
        />

        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Active Threads</CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500">{conversations.length} total interactions detected.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="p-12">
                <EmptyState title="No conversations yet" subtitle="Insights appear as shoppers interact with your AI widget." />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {conversations.map((c) => (
                  <Link 
                    key={c.id} 
                    href={`/dashboard/inbox/${c.id}?storeId=${storeId}`}
                    className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-all group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                         <span className="text-[13px] font-bold text-slate-900">Visitor {c.visitorId.slice(0, 8)}...</span>
                         <span className={cn(
                           "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                           c.status === "HANDOFF_REQUESTED" ? "bg-rose-50 text-rose-600" : 
                           c.status === "RESOLVED" ? "bg-emerald-50 text-emerald-600" : 
                           "bg-blue-50 text-blue-600"
                         )}>
                           {c.status.replace("_", " ")}
                         </span>
                      </div>
                      <p className="line-clamp-1 text-[13px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                        {c.messages[0]?.content || "No messages yet"}
                      </p>
                      {c.handoffReason ? (
                        <p className="text-[11px] font-bold text-rose-500 mt-1 italic">
                          Attention: {c.handoffReason}
                        </p>
                      ) : null}
                    </div>
                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                          <span className="text-xs font-bold">→</span>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
