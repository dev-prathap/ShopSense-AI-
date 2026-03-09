import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Textarea } from "@/components/ui/textarea";

async function saveSettings(formData: FormData) {
  "use server";

  const storeId = String(formData.get("storeId") || "");
  if (!storeId) return;

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
  const storeId = searchParams.storeId || "demo-store";
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  const appHost = process.env.SHOPIFY_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const snippet = `<script>
window.__AI_SALES_AGENT__ = {
  storeId: "${storeId}",
  host: "${appHost}",
  position: "right"
};
</script>
<script defer src="${appHost}/widget.js"></script>`;

  return (
    <AppShell
      storeId={storeId}
      nav={[
        { href: `/dashboard?storeId=${storeId}`, label: "Dashboard" },
        { href: `/dashboard/onboarding?storeId=${storeId}`, label: "Onboarding" },
        { href: `/dashboard/inbox?storeId=${storeId}`, label: "Inbox" },
        { href: `/dashboard/settings?storeId=${storeId}`, label: "Settings", active: true },
        { href: `/dashboard/billing?storeId=${storeId}`, label: "Billing" }
      ]}
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          title="AI Settings"
          subtitle="Tune recommendations, handoff behavior, and recovery prompts."
          action={<Link href={`/dashboard?storeId=${storeId}`} className="text-sm text-primary underline">Back</Link>}
        />

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Store Controls</CardTitle>
            <CardDescription>Week 3 operational controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveSettings} className="grid gap-4">
              <input type="hidden" name="storeId" value={storeId} />
              <div className="grid gap-2">
                <label className="text-sm font-medium">AI Tone</label>
                <Input name="aiTone" defaultValue={store?.aiTone || "concise_sales"} />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Max Recommendations</label>
                  <Input type="number" name="aiMaxRecommendations" defaultValue={store?.aiMaxRecommendations || 3} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Handoff Sensitivity</label>
                  <Input type="number" name="aiHandoffSensitivity" defaultValue={store?.aiHandoffSensitivity || 50} />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Recovery Discount %</label>
                  <Input type="number" name="cartRecoveryDiscountPct" defaultValue={store?.cartRecoveryDiscountPct || 10} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input name="supportEmail" defaultValue={store?.supportEmail || ""} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Handoff Webhook URL</label>
                <Input name="handoffWebhookUrl" defaultValue={store?.handoffWebhookUrl || ""} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="recoveryEnabled" defaultChecked={store?.recoveryEnabled ?? true} /> Enable recovery offers
              </label>
              <div>
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle>Install Widget</CardTitle>
            <CardDescription>Copy this snippet into your Shopify theme (before closing body tag).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea readOnly value={snippet} className="min-h-[180px] font-mono text-xs" />
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Checklist: script added, launcher visible, first message replies, product cards clickable.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
