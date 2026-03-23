"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AppWindow,
  CreditCard,
  FileText,
  Palette,
  Shield,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SectionKey = "billing" | "account" | "security" | "personalization" | "knowledge" | "apps";
type AiTone = "concise_sales" | "consultative" | "friendly";

const menu: { key: SectionKey; label: string; icon: any }[] = [
  { key: "account", label: "Account", icon: User },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "security", label: "Security", icon: Shield },
  { key: "personalization", label: "Personalization", icon: Palette },
  { key: "apps", label: "Apps", icon: AppWindow },
  { key: "knowledge", label: "Knowledge", icon: FileText }
];

export function SimpleSettingsCenter({ storeId, inModal = false }: { storeId: string; inModal?: boolean }) {
  const [active, setActive] = useState<SectionKey>("account");
  const title = useMemo(() => menu.find((item) => item.key === active)?.label ?? "Settings", [active]);
  const [loading, setLoading] = useState(true);

  const [account, setAccount] = useState({
    userName: "",
    userEmail: "",
    businessName: "",
    supportEmail: "",
    timezone: "Asia/Kolkata",
  });
  const [savingAccount, setSavingAccount] = useState(false);

  const [personalization, setPersonalization] = useState({
    aiTone: "friendly" as AiTone,
    aiMaxRecommendations: 3,
    aiHandoffSensitivity: 50,
    recoveryEnabled: true,
    cartRecoveryDiscountPct: 10,
  });
  const [savingPersonalization, setSavingPersonalization] = useState(false);

  const [billing, setBilling] = useState({
    monthlyLimit: 0,
    currentMonthMessages: 0,
    percentageUsed: 0,
    isOverLimit: false,
    resetDate: "",
  });
  const [billingBusy, setBillingBusy] = useState(false);

  const [storeInfo, setStoreInfo] = useState<{ shopDomain?: string; businessName?: string } | null>(null);
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [tokenBusy, setTokenBusy] = useState(false);
  const [securityToken, setSecurityToken] = useState("");
  const [knowledgeReady, setKnowledgeReady] = useState(false);
  const [knowledgeBaseUrl, setKnowledgeBaseUrl] = useState("");
  const [knowledgeSummary, setKnowledgeSummary] = useState("");
  const [knowledgeSourceId, setKnowledgeSourceId] = useState("");
  const [knowledgeSummarizing, setKnowledgeSummarizing] = useState(false);
  const [knowledgeSaving, setKnowledgeSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      try {
        const [accountRes, aiRes, usageRes, storeRes] = await Promise.allSettled([
          fetch(`/api/onboarding/business?storeId=${encodeURIComponent(storeId)}`),
          fetch(`/api/app/settings/ai?storeId=${encodeURIComponent(storeId)}`),
          fetch(`/api/app/usage?storeId=${encodeURIComponent(storeId)}`),
          fetch(`/api/widget/store-info?storeId=${encodeURIComponent(storeId)}`),
        ]);
        const [meRes, knowledgeRes] = await Promise.allSettled([
          fetch("/api/auth/me"),
          fetch(`/api/onboarding/knowledge/status?storeId=${encodeURIComponent(storeId)}`),
        ]);

        if (cancelled) return;

        if (accountRes.status === "fulfilled" && accountRes.value.ok) {
          const data = await accountRes.value.json();
          setAccount((prev) => ({
            ...prev,
            businessName: data?.businessName || "",
            supportEmail: data?.supportEmail || "",
          }));
        }

        if (aiRes.status === "fulfilled" && aiRes.value.ok) {
          const data = await aiRes.value.json();
          setPersonalization({
            aiTone: (data?.aiTone || "friendly") as AiTone,
            aiMaxRecommendations: data?.aiMaxRecommendations ?? 3,
            aiHandoffSensitivity: data?.aiHandoffSensitivity ?? 50,
            recoveryEnabled: data?.recoveryEnabled ?? true,
            cartRecoveryDiscountPct: data?.cartRecoveryDiscountPct ?? 10,
          });
          if (typeof data?.supportEmail === "string" && data.supportEmail) {
            setAccount((prev) => ({ ...prev, supportEmail: data.supportEmail }));
          }
        }

        if (usageRes.status === "fulfilled" && usageRes.value.ok) {
          const data = await usageRes.value.json();
          if (data?.usage) {
            setBilling({
              monthlyLimit: data.usage.monthlyLimit || 0,
              currentMonthMessages: data.usage.currentMonthMessages || 0,
              percentageUsed: data.usage.percentageUsed || 0,
              isOverLimit: !!data.usage.isOverLimit,
              resetDate: data.usage.resetDate || "",
            });
          }
        }

        if (storeRes.status === "fulfilled" && storeRes.value.ok) {
          const data = await storeRes.value.json();
          setStoreInfo({
            shopDomain: data?.shopDomain,
            businessName: data?.businessName,
          });
          if (data?.businessName) {
            setAccount((prev) => ({ ...prev, businessName: data.businessName }));
          }
          if (data?.shopDomain) {
            setKnowledgeBaseUrl((prev) => prev || `https://${data.shopDomain}`);
          }
        }

        if (meRes.status === "fulfilled" && meRes.value.ok) {
          const data = await meRes.value.json();
          if (data?.authenticated) {
            setAccount((prev) => ({
              ...prev,
              userName: data?.user?.name || "",
              userEmail: data?.user?.email || "",
            }));
          }
        }

        if (knowledgeRes.status === "fulfilled" && knowledgeRes.value.ok) {
          const data = await knowledgeRes.value.json();
          setKnowledgeReady(!!data?.ready);
          const preferredSource = (data?.sources || []).find((s: any) => s?.type === "CUSTOM") || data?.sources?.[0];
          if (preferredSource?.id) setKnowledgeSourceId(preferredSource.id);
          if (preferredSource?.url) setKnowledgeBaseUrl(preferredSource.url);
          if (preferredSource?.summaryText) setKnowledgeSummary(preferredSource.summaryText);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  async function saveAccount() {
    setSavingAccount(true);
    try {
      const res = await fetch("/api/onboarding/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          businessName: account.businessName || null,
          supportEmail: account.supportEmail || "",
        }),
      });
      if (!res.ok) throw new Error("Account save failed");
      toast.success("Account settings saved");
    } catch {
      toast.error("Failed to save account settings");
    } finally {
      setSavingAccount(false);
    }
  }

  async function savePersonalization() {
    setSavingPersonalization(true);
    try {
      const res = await fetch("/api/app/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          aiTone: personalization.aiTone,
          aiMaxRecommendations: personalization.aiMaxRecommendations,
          aiHandoffSensitivity: personalization.aiHandoffSensitivity,
          recoveryEnabled: personalization.recoveryEnabled,
          cartRecoveryDiscountPct: personalization.cartRecoveryDiscountPct,
          supportEmail: account.supportEmail || null,
        }),
      });
      if (!res.ok) throw new Error("Personalization save failed");
      toast.success("Personalization saved");
    } catch {
      toast.error("Failed to save personalization");
    } finally {
      setSavingPersonalization(false);
    }
  }

  async function startBillingCheckout() {
    setBillingBusy(true);
    window.location.href = `/dashboard/billing?storeId=${encodeURIComponent(storeId)}`;
  }

  async function runCatalogSync() {
    setSyncingCatalog(true);
    try {
      const res = await fetch("/api/app/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Sync failed");
      toast.success("Catalog sync complete");
    } catch {
      toast.error("Catalog sync failed");
    } finally {
      setSyncingCatalog(false);
    }
  }

  async function generateSecurityToken() {
    setTokenBusy(true);
    try {
      const visitorId = `settings-${Date.now()}`;
      const res = await fetch("/api/app/widget/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, visitorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token) throw new Error(data?.error || "Token generation failed");
      setSecurityToken(data.token);
      toast.success("Security token generated");
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setTokenBusy(false);
    }
  }

  async function autoSummarizeFromStoreUrl() {
    if (!knowledgeBaseUrl.trim()) {
      toast.error("Store URL required");
      return;
    }
    setKnowledgeSummarizing(true);
    try {
      const sourceRes = await fetch("/api/onboarding/knowledge/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          sources: [{ type: "CUSTOM", url: knowledgeBaseUrl.trim() }],
        }),
      });
      const sourceData = await sourceRes.json().catch(() => ({}));
      if (!sourceRes.ok || !sourceData?.ok) throw new Error("Failed to save source");
      const createdSource =
        (sourceData?.sources || []).find((s: any) => s?.type === "CUSTOM" && s?.url === knowledgeBaseUrl.trim()) ||
        sourceData?.sources?.[0];
      if (!createdSource?.id) throw new Error("Source not found");
      setKnowledgeSourceId(createdSource.id);

      const fetchRes = await fetch("/api/onboarding/knowledge/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, sourceIds: [createdSource.id], force: true }),
      });
      if (!fetchRes.ok) throw new Error("Failed to fetch source");

      const summarizeRes = await fetch("/api/onboarding/knowledge/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, sourceIds: [createdSource.id], force: true }),
      });
      if (!summarizeRes.ok) throw new Error("Failed to summarize");

      const statusRes = await fetch(`/api/onboarding/knowledge/status?storeId=${encodeURIComponent(storeId)}`);
      const statusData = await statusRes.json().catch(() => ({}));
      const updatedSource = (statusData?.sources || []).find((s: any) => s?.id === createdSource.id);
      setKnowledgeSummary(updatedSource?.summaryText || "");
      setKnowledgeReady(!!statusData?.ready);
      toast.success("Summary generated");
    } catch {
      toast.error("Auto summarize failed");
    } finally {
      setKnowledgeSummarizing(false);
    }
  }

  async function saveKnowledgeSummary() {
    if (!knowledgeSourceId) {
      toast.error("Generate summary first");
      return;
    }
    if (!knowledgeSummary.trim()) {
      toast.error("Summary cannot be empty");
      return;
    }
    setKnowledgeSaving(true);
    try {
      const res = await fetch("/api/onboarding/knowledge/source/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          sourceId: knowledgeSourceId,
          summaryText: knowledgeSummary.trim(),
          publish: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) throw new Error("Failed to save summary");
      setKnowledgeReady(!!data?.ready);
      toast.success("Knowledge summary updated");
    } catch {
      toast.error("Failed to save summary");
    } finally {
      setKnowledgeSaving(false);
    }
  }

  return (
    <div className={cn("mx-auto w-full", inModal ? "max-w-[1180px] p-2 md:p-3" : "max-w-6xl p-6 md:p-8")}>
      <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-none">
        <div className="grid min-h-[76vh] md:grid-cols-[265px_1fr]">
          <aside className="border-r border-slate-200 bg-[#f8fafc] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Settings</p>
            <div className="space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                    className={`relative flex h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      isActive ? "bg-[#0078D4] text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="settings-active-tab"
                        className="absolute inset-0 rounded-lg bg-[#0078D4]"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      />
                    ) : null}
                    <Icon size={16} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="bg-white p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">Store: {storeId}</p>
              </div>
            </div>
            {loading ? <p className="text-sm text-slate-500">Loading settings...</p> : null}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {active === "billing" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>Simple billing overview for your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="font-semibold text-slate-900">Neryn Assist</p>
                          <p className="text-sm text-slate-500">$49/month</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                        <p>
                          Usage: <span className="font-semibold text-slate-800">{billing.currentMonthMessages}</span> / {billing.monthlyLimit || "-"} messages
                        </p>
                        <p>
                          Used: <span className="font-semibold text-slate-800">{billing.percentageUsed}%</span>
                          {billing.resetDate ? ` | Reset: ${new Date(billing.resetDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <Button
                        onClick={startBillingCheckout}
                        disabled={billingBusy}
                        className="bg-[#0078D4] text-white hover:bg-[#106EBE]"
                      >
                        {billingBusy ? "Opening checkout..." : "Manage Billing"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {active === "account" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Account Details</CardTitle>
                      <CardDescription>Profile, store identity, and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input placeholder="Your name" value={account.userName} readOnly />
                      <Input type="email" placeholder="Your account email" value={account.userEmail} readOnly />
                      <Input
                        placeholder="Store name"
                        value={account.businessName}
                        onChange={(e) => setAccount((prev) => ({ ...prev, businessName: e.target.value }))}
                      />
                      <Input placeholder="Store domain" value={storeInfo?.shopDomain || ""} readOnly />
                      <Input
                        type="email"
                        placeholder="Support email"
                        value={account.supportEmail}
                        onChange={(e) => setAccount((prev) => ({ ...prev, supportEmail: e.target.value }))}
                      />
                      <Input
                        placeholder="Timezone"
                        value={account.timezone}
                        onChange={(e) => setAccount((prev) => ({ ...prev, timezone: e.target.value }))}
                      />
                      <Button onClick={saveAccount} disabled={savingAccount} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                        {savingAccount ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {active === "security" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                      <CardDescription>Control access and sign-in safety.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="font-semibold text-slate-900">Multi-factor authentication</p>
                          <p className="text-sm text-slate-500">Add one extra verification step.</p>
                        </div>
                        <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                          <p className="font-semibold text-slate-900">Login alert emails</p>
                          <p className="text-sm text-slate-500">Get notified for new device logins.</p>
                        </div>
                        <Switch checked={loginAlertsEnabled} onCheckedChange={setLoginAlertsEnabled} />
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                        <p className="mb-2 font-semibold text-slate-800">Widget security token</p>
                        <p className="mb-3">Generate a short-lived token using admin API.</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button onClick={generateSecurityToken} disabled={tokenBusy} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                            {tokenBusy ? "Generating..." : "Generate Token"}
                          </Button>
                          {securityToken ? <code className="max-w-[320px] truncate rounded bg-slate-100 px-2 py-1 text-xs">{securityToken}</code> : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {active === "personalization" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Personalization</CardTitle>
                      <CardDescription>Tune your day-to-day app preference.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <label className="text-xs font-semibold text-slate-600">AI Tone</label>
                      <div className="flex gap-2">
                        <Button
                          variant={personalization.aiTone === "friendly" ? "default" : "outline"}
                          className={personalization.aiTone === "friendly" ? "bg-[#0078D4] hover:bg-[#106EBE]" : ""}
                          onClick={() => setPersonalization((prev) => ({ ...prev, aiTone: "friendly" }))}
                        >
                          Friendly
                        </Button>
                        <Button
                          variant={personalization.aiTone === "consultative" ? "default" : "outline"}
                          className={personalization.aiTone === "consultative" ? "bg-[#0078D4] hover:bg-[#106EBE]" : ""}
                          onClick={() => setPersonalization((prev) => ({ ...prev, aiTone: "consultative" }))}
                        >
                          Consultative
                        </Button>
                        <Button
                          variant={personalization.aiTone === "concise_sales" ? "default" : "outline"}
                          className={personalization.aiTone === "concise_sales" ? "bg-[#0078D4] hover:bg-[#106EBE]" : ""}
                          onClick={() => setPersonalization((prev) => ({ ...prev, aiTone: "concise_sales" }))}
                        >
                          Concise
                        </Button>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Max recommendations"
                        value={String(personalization.aiMaxRecommendations)}
                        onChange={(e) =>
                          setPersonalization((prev) => ({
                            ...prev,
                            aiMaxRecommendations: Number(e.target.value || 1),
                          }))
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Handoff sensitivity"
                        value={String(personalization.aiHandoffSensitivity)}
                        onChange={(e) =>
                          setPersonalization((prev) => ({
                            ...prev,
                            aiHandoffSensitivity: Number(e.target.value || 0),
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                          <Switch
                            checked={personalization.recoveryEnabled}
                            onCheckedChange={(checked) => setPersonalization((prev) => ({ ...prev, recoveryEnabled: checked }))}
                          />
                          Recovery Enabled
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          className="w-[180px]"
                          placeholder="Discount %"
                          value={String(personalization.cartRecoveryDiscountPct)}
                          onChange={(e) =>
                            setPersonalization((prev) => ({
                              ...prev,
                              cartRecoveryDiscountPct: Number(e.target.value || 0),
                            }))
                          }
                        />
                      </div>
                      <Button
                        onClick={savePersonalization}
                        disabled={savingPersonalization}
                        className="bg-[#0078D4] text-white hover:bg-[#106EBE]"
                      >
                        {savingPersonalization ? "Saving..." : "Save Preferences"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {active === "knowledge" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Knowledge Sources</CardTitle>
                      <CardDescription>Enter your store URL. We auto-summarize it, then you can edit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 text-sm">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-600">
                        Status:{" "}
                        <span className={cn("font-semibold", knowledgeReady ? "text-emerald-600" : "text-amber-600")}>
                          {knowledgeReady ? "Ready" : "Needs review"}
                        </span>
                      </div>
                      <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-800">Store URL</p>
                        <Textarea
                          rows={2}
                          placeholder="https://yourstore.com"
                          value={knowledgeBaseUrl}
                          onChange={(e) => setKnowledgeBaseUrl(e.target.value)}
                        />
                        <Button onClick={autoSummarizeFromStoreUrl} disabled={knowledgeSummarizing} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                          {knowledgeSummarizing ? "Summarizing..." : "Auto Summarize"}
                        </Button>
                      </div>

                      <div className="space-y-2 rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-800">Summary (Editable)</p>
                        <Textarea
                          rows={10}
                          placeholder="Generated summary will appear here..."
                          value={knowledgeSummary}
                          onChange={(e) => setKnowledgeSummary(e.target.value)}
                        />
                        <Button onClick={saveKnowledgeSummary} disabled={knowledgeSaving} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                          {knowledgeSaving ? "Saving..." : "Save Summary"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {active === "apps" && (
                  <Card className="rounded-xl border-slate-200 shadow-none">
                    <CardHeader>
                      <CardTitle>Apps</CardTitle>
                      <CardDescription>Connected tools and integrations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="rounded-xl border border-slate-200 p-3">
                        <p className="font-semibold text-slate-900">Shop Domain</p>
                        <p className="text-sm text-slate-500">{storeInfo?.shopDomain || "Not available"}</p>
                      </div>
                      {[
                        { name: "Shopify", status: storeInfo?.shopDomain ? "Connected" : "Unknown" },
                        { name: "Google Analytics", status: "Not connected" },
                        { name: "Gorgias", status: "Not connected" }
                      ].map((app) => (
                        <div key={app.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                          <div>
                            <p className="font-semibold text-slate-900">{app.name}</p>
                            <p className="text-sm text-slate-500">{app.status}</p>
                          </div>
                          <Button variant="outline">{app.name === "Shopify" ? "Connected" : "Configure"}</Button>
                        </div>
                      ))}
                      <Button onClick={runCatalogSync} disabled={syncingCatalog} className="bg-[#0078D4] text-white hover:bg-[#106EBE]">
                        {syncingCatalog ? "Syncing..." : "Sync Catalog"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </Card>
    </div>
  );
}
