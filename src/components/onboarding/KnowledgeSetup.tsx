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
  { type: "PRIVACY", label: "Privacy Policy URL" },
  { type: "SHIPPING", label: "Shipping Policy URL" },
  { type: "RETURNS", label: "Returns Policy URL" },
  { type: "FAQ", label: "FAQ URL" },
  { type: "CONTACT", label: "Contact URL" }
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
    <Card>
      <CardHeader>
        <CardTitle>2. Train AI Knowledge</CardTitle>
        <CardDescription>
          Paste your website URL. We auto-find policies and train your AI in one click.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
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
          <p className="text-xs text-muted-foreground">Published sources: {onboardingState.publishedSources}</p>
        </div>
        <ProgressLine steps={lifecycleSteps} active={Math.max(0, activeStep)} />

        <div className="flex gap-2">
          <Input
            placeholder="https://yourstore.com"
            value={rootUrl}
            onChange={(e) => setRootUrl(e.target.value)}
          />
          <Button onClick={runMagicTrain} disabled={Boolean(loading) || !rootUrl.trim()}>
            {loading === "magic" ? "Training..." : "Auto Find & Train"}
          </Button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <details className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">Manual links (if auto-detect misses pages)</summary>
          <div className="mt-3 space-y-3">
            {BASE_TYPES.map((item) => (
              <div key={item.type} className="space-y-1">
                <label className="text-xs text-muted-foreground">{item.label}</label>
                <Input
                  placeholder="https://..."
                  value={manualUrls[item.type] || ""}
                  onChange={(e) => setManualUrls((prev) => ({ ...prev, [item.type]: e.target.value }))}
                />
              </div>
            ))}
            <Button onClick={saveManualSources} disabled={Boolean(loading)}>
              {loading === "manual-save" ? "Saving..." : "Save & Train Manual Links"}
            </Button>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
