"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProgressLine } from "@/components/app/ProgressLine";
import { StatusPill } from "@/components/app/StatusPill";
import { OnboardingState } from "@/lib/ui/contracts";

type SourceRow = {
  id: string;
  type: "PRIVACY" | "SHIPPING" | "RETURNS" | "FAQ" | "CONTACT" | "CUSTOM";
  url: string;
  status: "PENDING" | "FETCHED" | "SUMMARIZED" | "APPROVED" | "PUBLISHED" | "FAILED";
};

const BASE_TYPES: Array<{ type: SourceRow["type"]; label: string }> = [
  { type: "PRIVACY", label: "Privacy Policy" },
  { type: "SHIPPING", label: "Shipping Policy" },
  { type: "RETURNS", label: "Returns Policy" },
  { type: "FAQ", label: "FAQs" },
  { type: "CONTACT", label: "Contact Page" }
];

export function KnowledgeSetup({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [rootUrl, setRootUrl] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [manualUrls, setManualUrls] = useState<Record<string, string>>({});
  const [knowledgeStatus, setKnowledgeStatus] = useState<OnboardingState["knowledgeStatus"]>("idle");

  async function loadStatus(): Promise<boolean> {
    const res = await fetch(`/api/onboarding/knowledge/status?storeId=${encodeURIComponent(storeId)}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "failed_to_load_status");
      return false;
    }
    const list = (data.sources || []) as SourceRow[];
    setSources(list);
    const published = list.filter((s) => s.status === "PUBLISHED").length;
    const isReady = Boolean(data.ready) || published > 0;
    setReady(isReady);

    const mapped: Record<string, string> = {};
    for (const row of list) {
      if (row.type !== "CUSTOM") {
        mapped[row.type] = row.url;
      }
    }
    setManualUrls(mapped);
    setError(null);
    setKnowledgeStatus(isReady ? "ready" : "idle");
    return isReady;
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  async function runMagicTrain() {
    if (!rootUrl.trim()) {
      setError("Please enter your website URL.");
      return;
    }
    setLoading("magic");
    setError(null);
    setKnowledgeStatus("discovering");
    try {
      const discover = await fetch("/api/onboarding/knowledge/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, rootUrl: rootUrl.trim() })
      });
      if (!discover.ok) throw new Error("Could not auto-discover your policy pages.");

      setKnowledgeStatus("fetching");
      const fetchRes = await fetch("/api/onboarding/knowledge/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `magic-fetch-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!fetchRes.ok) throw new Error("Failed while reading your pages.");

      setKnowledgeStatus("summarizing");
      const summarize = await fetch("/api/onboarding/knowledge/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `magic-sum-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!summarize.ok) throw new Error("Failed while summarizing your pages.");

      const approve = await fetch("/api/onboarding/knowledge/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId })
      });
      if (!approve.ok) throw new Error("Failed at approval step.");

      setKnowledgeStatus("publishing");
      const publish = await fetch("/api/onboarding/knowledge/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `magic-publish-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!publish.ok) throw new Error("Failed while training AI knowledge.");

      const isReady = await loadStatus();
      setKnowledgeStatus(isReady ? "ready" : "idle");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training failed.");
      setKnowledgeStatus("failed");
    } finally {
      setLoading(null);
    }
  }

  async function saveManualSources() {
    setLoading("manual-save");
    setError(null);
    setKnowledgeStatus("fetching");
    try {
      const payload = BASE_TYPES.map((item) => ({
        type: item.type,
        url: (manualUrls[item.type] || "").trim()
      })).filter((x) => x.url.length > 0);

      const save = await fetch("/api/onboarding/knowledge/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, sources: payload })
      });
      if (!save.ok) throw new Error("Could not save manual URLs.");

      await runManualTrain();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Manual setup failed.");
      setKnowledgeStatus("failed");
      setLoading(null);
    }
  }

  async function runManualTrain() {
    try {
      const fetchRes = await fetch("/api/onboarding/knowledge/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `manual-fetch-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!fetchRes.ok) throw new Error("Failed while reading manual URLs.");

      const summarize = await fetch("/api/onboarding/knowledge/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `manual-sum-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!summarize.ok) throw new Error("Failed while summarizing manual URLs.");

      const approve = await fetch("/api/onboarding/knowledge/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId })
      });
      if (!approve.ok) throw new Error("Failed at approval step.");

      const publish = await fetch("/api/onboarding/knowledge/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `manual-publish-${Date.now()}` },
        body: JSON.stringify({ storeId })
      });
      if (!publish.ok) throw new Error("Failed while publishing manual URLs.");

      const isReady = await loadStatus();
      setKnowledgeStatus(isReady ? "ready" : "idle");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const publishedCount = useMemo(
    () => sources.filter((s) => s.status === "PUBLISHED").length,
    [sources]
  );

  const onboardingState: OnboardingState = {
    connected: true,
    knowledgeStatus,
    publishedSources: publishedCount,
    lastTrainedAt: null,
    canComplete: ready
  };

  const lifecycleSteps = ["Finding links", "Reading pages", "Training AI", "Ready"];
  const activeStep =
    onboardingState.knowledgeStatus === "discovering"
      ? 0
      : onboardingState.knowledgeStatus === "fetching"
        ? 1
        : onboardingState.knowledgeStatus === "summarizing" || onboardingState.knowledgeStatus === "publishing"
          ? 2
          : onboardingState.knowledgeStatus === "ready"
            ? 3
            : -1;

  return (
    <Card className="glass-card border-slate-200/60 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-slate-900">2. Train AI Knowledge</CardTitle>
            <CardDescription className="text-[15px] font-medium text-slate-500">
              Paste your website URL. We'll find policies and train your AI in one click.
            </CardDescription>
          </div>
          <div className="text-right">
             <StatusPill
                label={
                  onboardingState.knowledgeStatus === "ready"
                    ? "AI Ready"
                    : onboardingState.knowledgeStatus === "failed"
                      ? "Training failed"
                      : onboardingState.publishedSources > 0
                        ? "Partially trained"
                      : "Awaiting training"
                }
                tone={
                  onboardingState.knowledgeStatus === "ready"
                    ? "success"
                    : onboardingState.knowledgeStatus === "failed"
                      ? "error"
                      : "neutral"
                }
              />
              <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                Sources: {onboardingState.publishedSources}
              </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        <div className="space-y-6">
          <ProgressLine steps={lifecycleSteps} active={Math.max(0, activeStep)} />

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="https://yourstore.com"
                value={rootUrl}
                onChange={(e) => setRootUrl(e.target.value)}
                className="h-12 bg-white/50 border-slate-200 focus:ring-blue-500/20 px-4 text-base transition-all"
              />
            </div>
            <Button 
              onClick={runMagicTrain} 
              disabled={Boolean(loading) || !rootUrl.trim()}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading === "magic" ? (
                <>Training AI...</>
              ) : (
                <>Auto Find & Train</>
              )}
            </Button>
          </div>

          {error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-medium">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <details className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 transition-all overflow-hidden">
            <summary className="flex items-center justify-between cursor-pointer p-4 list-none">
              <span className="text-sm font-bold text-slate-700">Add Custom Knowledge</span>
              <span className="text-slate-400 font-bold group-open:rotate-180 transition-transform">↓</span>
            </summary>
            <div className="p-4 pt-0 space-y-4 border-t border-slate-200/40 mt-1">
              <div className="space-y-1.5 mt-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                <Input
                  placeholder="e.g. Brand History"
                  id="manual-title"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Content</label>
                <textarea
                  id="manual-content"
                  placeholder="Paste facts, about us, or FAQs..."
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
              <Button 
                className="w-full bg-slate-900 hover:bg-black text-white font-bold h-11"
                onClick={async () => {
                  const title = (document.getElementById("manual-title") as HTMLInputElement).value;
                  const content = (document.getElementById("manual-content") as HTMLTextAreaElement).value;
                  if (!title || !content) return;
                  
                  setLoading("manual-text");
                  try {
                    const res = await fetch("/api/onboarding/knowledge/manual-text", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ storeId, title, content })
                    });
                    if (!res.ok) throw new Error("Failed to save text.");
                    
                    (document.getElementById("manual-title") as HTMLInputElement).value = "";
                    (document.getElementById("manual-content") as HTMLTextAreaElement).value = "";
                    await loadStatus();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Failed to save text.");
                  } finally {
                    setLoading(null);
                  }
                }} 
                disabled={Boolean(loading)}
              >
                {loading === "manual-text" ? "Processing..." : "Add to Knowledge Base"}
              </Button>
            </div>
          </details>

          <details className="group rounded-2xl border border-slate-200/60 bg-slate-50/50 transition-all overflow-hidden">
            <summary className="flex items-center justify-between cursor-pointer p-4 list-none">
              <span className="text-sm font-bold text-slate-700">Manual Links</span>
              <span className="text-slate-400 font-bold group-open:rotate-180 transition-transform">↓</span>
            </summary>
            <div className="p-4 pt-0 space-y-3 border-t border-slate-200/40 mt-1">
              <div className="grid gap-3 pt-3">
                {BASE_TYPES.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</label>
                    <Input
                      placeholder="https://..."
                      value={manualUrls[item.type] || ""}
                      onChange={(e) => setManualUrls((prev) => ({ ...prev, [item.type]: e.target.value }))}
                      className="h-10 bg-white border-slate-200"
                    />
                  </div>
                ))}
              </div>
              <Button 
                onClick={saveManualSources} 
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-100 font-bold h-11 mt-2"
                variant="outline"
                disabled={Boolean(loading)}
              >
                {loading === "manual-save" ? "Saving..." : "Train Manual Links"}
              </Button>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
