import Link from "next/link";
import { checkStoreAccess, validateStoreAccess } from "@/lib/auth/store-access";
import { ThemeEmbedPanel } from "@/components/app/ThemeEmbedPanel";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Textarea } from "@/components/ui/textarea";
import { SyncButton } from "@/components/app/SyncButton";

/**
 * Reachable as a plain POST endpoint — the validateStoreAccess call in the page
 * component guards the render, not this submission, and storeId arrives from
 * the caller. Without its own check anyone could rewrite any store's config,
 * including handoffWebhookUrl, which is where that store's conversation
 * handoffs get delivered.
 */
async function saveSettings(formData: FormData) {
  "use server";

  const storeId = String(formData.get("storeId") || "");
  if (!storeId) return;
  if (!(await checkStoreAccess(storeId))) return;

  await prisma.store.update({
    where: { id: storeId },
    data: {
      aiTone: String(formData.get("aiTone") || "concise_sales"),
      aiMaxRecommendations: Number(formData.get("aiMaxRecommendations") || 3),
      aiHandoffSensitivity: Number(formData.get("aiHandoffSensitivity") || 50),
      recoveryEnabled: formData.get("recoveryEnabled") === "on",
      cartRecoveryDiscountPct: Number(formData.get("cartRecoveryDiscountPct") || 10),
      supportEmail: String(formData.get("supportEmail") || "") || null,
      handoffWebhookUrl: String(formData.get("handoffWebhookUrl") || "") || null
    }
  });
}

export default async function SettingsPage({ searchParams }: { searchParams: { storeId?: string } }) {
  const { storeId } = await validateStoreAccess(searchParams.storeId);
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Insights" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Knowledge" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Conversations" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Configuration", active: true },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Plan" }
      ]}
    >
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Agent Configuration"
          subtitle="Define how your AI agent behaves, communicates, and converts."
          action={<Link href={`/dashboard?storeId=${storeId}`} className="text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">Back to Insights</Link>}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 rounded-[2rem]">
              <CardHeader className=" from-slate-50/80 to-white border-b border-slate-100/60 pb-8 pt-8 px-10">
                <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Agent Persona</CardTitle>
                <CardDescription className="text-[14px] font-medium text-slate-500 mt-2 tracking-normal">Tune the voice and operational limits of your conversational sales agent.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 bg-white">
                <form action={saveSettings} className="space-y-10">
                  <input type="hidden" name="storeId" value={storeId} />
                  
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">AI Tone</label>
                      <Input name="aiTone" defaultValue={store?.aiTone || "concise_sales"} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700" placeholder="e.g. Friendly, Professional, Concise" />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Support Email</label>
                      <Input name="supportEmail" defaultValue={store?.supportEmail || ""} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700" placeholder="support@yourbrand.com" />
                    </div>
                  </div>

                  <div className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Max Recommendations</label>
                      <Input type="number" name="aiMaxRecommendations" defaultValue={store?.aiMaxRecommendations || 3} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700" min={1} max={5} />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Support Sensitivity</label>
                      <Input type="number" name="aiHandoffSensitivity" defaultValue={store?.aiHandoffSensitivity || 50} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700" min={1} max={100} />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Recovery Discount %</label>
                      <Input type="number" name="cartRecoveryDiscountPct" defaultValue={store?.cartRecoveryDiscountPct || 10} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700" min={0} max={100} />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Escalation Webhook</label>
                    <Input name="handoffWebhookUrl" defaultValue={store?.handoffWebhookUrl || ""} className="h-14 border-slate-200 bg-slate-50/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-slate-700 font-mono text-[13px]" placeholder="https://api.yourbrand.com/webhook/escalate" />
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                       <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Enable Smart Recovery</p>
                       <p className="text-[13px] font-medium text-slate-500">Automatically offer targeted discounts to recovering abandoned carts.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="recoveryEnabled" defaultChecked={store?.recoveryEnabled ?? true} className="sr-only peer" />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-12 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-[15px]">Save Configuration</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass-card overflow-hidden bg-[#0A0A0A] border-none shadow-2xl rounded-[2rem] relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 relative pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
              
              <CardHeader className="pb-6 pt-8 px-8 relative z-10 border-b border-white/[0.05]">
                <CardTitle className="text-[17px] font-bold text-white flex items-center gap-3 tracking-tight">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </div>
                  Storefront Widget
                </CardTitle>
                <CardDescription className="text-slate-400 text-[13px] font-medium mt-2">Neryn ships as an app embed. Switch it on in your theme and the assistant appears on your storefront.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8 relative z-10">
                <ThemeEmbedPanel shopDomain={store?.shopDomain ?? ""} />
                
                <div className="mt-8 pt-6 border-t border-white/[0.05]">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Catalog Management</p>
                   <div className="space-y-3">
                     <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                             <div className="w-2 h-2 rounded-full bg-emerald-400" />
                         </div>
                         <div className="flex-1">
                             <p className="text-[13px] font-bold text-emerald-100">Products Indexed</p>
                             <p className="text-[11px] font-medium text-slate-400">Sync your catalog for AI recommendations</p>
                         </div>
                     </div>
                     <SyncButton storeId={storeId} />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
