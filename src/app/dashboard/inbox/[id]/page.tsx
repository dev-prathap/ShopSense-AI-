import { cn } from "@/lib/utils";
import { checkStoreAccess, validateStoreAccess } from "@/lib/auth/store-access";
import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { revalidatePath } from "next/cache";

/**
 * These actions are reachable as plain POST endpoints, independently of the
 * page that renders their forms — the validateStoreAccess call below guards the
 * render, not the submission. Both ids arrive from the caller, so each action
 * has to establish that the caller holds the store *and* that the conversation
 * belongs to it; checking only the store would let someone pair their own
 * storeId with another merchant's conversationId.
 */
async function merchantReply(formData: FormData) {
  "use server";
  const conversationId = String(formData.get("conversationId"));
  const storeId = String(formData.get("storeId"));
  const content = String(formData.get("content")).trim();

  if (!content) return;
  if (!(await checkStoreAccess(storeId))) return;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, storeId },
    select: { id: true }
  });
  if (!conversation) return;

  await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content,
      confidence: 1.0,
      intent: "merchant_reply"
    }
  });

  revalidatePath(`/dashboard/inbox/${conversationId}`);
}

async function resolveConversation(formData: FormData) {
  "use server";
  const conversationId = String(formData.get("conversationId"));
  const storeId = String(formData.get("storeId"));

  if (!(await checkStoreAccess(storeId))) return;

  // updateMany so storeId stays in the where clause — update() would only
  // accept the unique id and drop the ownership constraint.
  await prisma.conversation.updateMany({
    where: { id: conversationId, storeId },
    data: { status: "RESOLVED", resolvedAt: new Date() }
  });

  redirect(`/dashboard/inbox?storeId=${storeId}`);
}

export default async function ConversationDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { storeId?: string }
}) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id, storeId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!conversation) {
    return notFound();
  }

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
          title="Interaction Review"
          subtitle={`Chat session with Visitor ${conversation.visitorId.slice(0, 8)}...`}
          action={
            <Link href={`/dashboard/inbox?storeId=${storeId}`}>
              <Button variant="ghost" className="text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-all">Back to Conversations</Button>
            </Link>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-8">
            <Card className="glass-card flex h-[600px] flex-col overflow-hidden border-none shadow-xl">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-sm font-bold text-slate-900">Transcript History</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                <div className="flex flex-col gap-6">
                  {conversation.messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[80%] ${m.role === "user" ? "self-start" : "self-end items-end text-right"}`}
                    >
                      <div className={`rounded-2xl px-5 py-3 text-[14px] leading-relaxed shadow-sm ${
                        m.role === "user" 
                          ? "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none" 
                          : "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                      }`}>
                        {m.content}
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {m.intent === "merchant_reply" && " • Replied by Agent"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-[13px] font-bold text-slate-900">Step in and Reply</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form action={merchantReply} className="flex flex-col gap-4">
                  <input type="hidden" name="conversationId" value={conversation.id} />
                  <input type="hidden" name="storeId" value={storeId} />
                  <Textarea 
                    name="content" 
                    placeholder="Type your message to the customer..."
                    className="min-h-[120px] resize-none border-slate-200 rounded-2xl p-4 text-[14px] focus:ring-4 focus:ring-blue-500/5 transition-all"
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-all">Send Reply</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-sm font-bold text-slate-900">Interaction Meta</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
                  <span className={cn(
                           "inline-block text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                           conversation.status === "HANDOFF_REQUESTED" ? "bg-rose-50 text-rose-600" : 
                           conversation.status === "RESOLVED" ? "bg-emerald-50 text-emerald-600" : 
                           "bg-blue-50 text-blue-600"
                         )}>
                    {conversation.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visitor Profile</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 font-mono text-[11px] text-slate-600 break-all leading-relaxed">
                    {conversation.visitorId}
                  </div>
                </div>

                {conversation.handoffReason && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Handoff Trigger</p>
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl text-[13px] font-bold text-rose-600 italic">
                      {conversation.handoffReason}
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-slate-100 mt-4">
                  <form action={resolveConversation}>
                    <input type="hidden" name="conversationId" value={conversation.id} />
                    <input type="hidden" name="storeId" value={storeId} />
                    <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-500 hover:text-slate-900 transition-all" type="submit">
                      Mark as Resolved
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
