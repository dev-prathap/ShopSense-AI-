"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  MessageSquare,
  Package,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { completeWizard, updateWizardStep, getWizardStatus, activateTrial } from "./actions";

type Step = "SYNC" | "TONE" | "PREVIEW" | "BILLING" | "SUCCESS";

const STEP_MAP: Record<Step, number> = { SYNC: 1, TONE: 2, PREVIEW: 3, BILLING: 4, SUCCESS: 10 };
const REV_STEP_MAP: Record<number, Step> = { 1: "SYNC", 2: "TONE", 3: "PREVIEW", 4: "BILLING", 10: "SUCCESS" };

const WIZARD_STEP_LABELS: Array<{ key: Step; label: string }> = [
  { key: "SYNC", label: "Sync" },
  { key: "TONE", label: "Persona" },
  { key: "PREVIEW", label: "Preview" },
  { key: "BILLING", label: "Activate" },
];

const SYNC_ITEMS = [
  { icon: <Package size={14} />,  label: "Products & variants", threshold: 20 },
  { icon: <FileText size={14} />, label: "Store policies",       threshold: 45 },
  { icon: <Zap size={14} />,      label: "Training AI models",   threshold: 70 },
  { icon: <Sparkles size={14} />, label: "Finalizing persona",   threshold: 90 },
];

const TONES = [
  {
    name: "Professional",
    desc: "Expert, precise, and trustworthy.",
    icon: <ShieldCheck size={18} />,
    accent: "border-blue-400 bg-blue-50/40",
    iconActive: "bg-blue-600",
    preview: "Thank you for your interest. I can confirm this product is available in your size with a 30-day return window. Shall I add it to your cart?"
  },
  {
    name: "Friendly",
    desc: "Warm, approachable, and helpful.",
    icon: <MessageSquare size={18} />,
    accent: "border-emerald-400 bg-emerald-50/40",
    iconActive: "bg-emerald-600",
    preview: "Oh great choice! That one's really popular right now. Want me to check if your size is in stock? I can add it to your cart right away!"
  },
  {
    name: "Luxury",
    desc: "Premium, curated, and exclusive.",
    icon: <Sparkles size={18} />,
    accent: "border-violet-400 bg-violet-50/40",
    iconActive: "bg-violet-600",
    preview: "An exquisite selection. I can personally curate the ideal size and confirm availability from our curated collection. May I arrange this for you?"
  }
];

const PREVIEW_CONVERSATIONS: Record<string, { question: string; answer: string; color: string; badge: string }> = {
  Professional: {
    question: "Do you carry this jacket in a medium? I need it by next Thursday.",
    answer:   "Yes, the Merino Jacket is available in Medium — 4 units in stock. With standard shipping your estimated delivery is Tuesday. Would you like me to reserve it now?",
    color:    "bg-blue-50 border-blue-100",
    badge:    "Professional mode"
  },
  Friendly: {
    question: "Hey! Do you have this jacket in a medium? I need it kinda soon haha",
    answer:   "You're in luck — we've got 4 Mediums left! With standard shipping it'd arrive by Tuesday, so well within your timeframe. Want me to pop it in your cart?",
    color:    "bg-emerald-50 border-emerald-100",
    badge:    "Friendly mode"
  },
  Luxury: {
    question: "I'm looking for the jacket in a medium. Is expedited delivery an option?",
    answer:   "Of course. The Merino Jacket in Medium is available from our current collection. We offer priority fulfilment with guaranteed 2-day arrival. Shall I arrange this for you?",
    color:    "bg-violet-50 border-violet-100",
    badge:    "Luxury mode"
  }
};

function WizardStepDots({ current }: { current: Step }) {
  if (current === "SUCCESS") return null;
  const stepKeys = WIZARD_STEP_LABELS.map(s => s.key);
  const currentIdx = stepKeys.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {WIZARD_STEP_LABELS.map((s, i) => {
        const done = currentIdx > i;
        const active = currentIdx === i;
        return (
          <React.Fragment key={s.key}>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all",
              active ? "bg-slate-900 text-white" : done ? "bg-emerald-100 text-emerald-700" : "text-slate-300"
            )}>
              {done && <CheckCircle2 size={11} />}
              {s.label}
            </div>
            {i < WIZARD_STEP_LABELS.length - 1 && (
              <div className={cn("h-px w-4 rounded-full transition-colors", done ? "bg-emerald-300" : "bg-slate-200")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WizardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const webhookStatus = searchParams.get("webhookStatus");

  const [currentStep, setCurrentStep] = useState<Step>("SYNC");
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [billingError, setBillingError] = useState("");

  const hasInitialized = useRef(false);
  const confettiFired = useRef(false);

  // Confetti on SUCCESS
  useEffect(() => {
    if (currentStep === "SUCCESS" && !confettiFired.current) {
      confettiFired.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.55, x: 0.5 }, colors: ["#0f172a", "#3b82f6", "#10b981", "#8b5cf6"], gravity: 1.2, scalar: 0.9, ticks: 200 });
        setTimeout(() => confetti({ particleCount: 40, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#6366f1", "#22d3ee", "#f59e0b"] }), 400);
        setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#6366f1", "#22d3ee", "#f59e0b"] }), 600);
      });
    }
  }, [currentStep]);

  // Init from DB
  useEffect(() => {
    if (!storeId && !isInitializing) { router.push("/dashboard/connect"); return; }
    if (!storeId || hasInitialized.current) return;
    hasInitialized.current = true;

    async function init() {
      try {
        const status = await getWizardStatus(storeId!);
        if (status) {
          const subActive = status.billingSubscription?.active || false;
          if (status.onboardingCompletedAt && subActive) { router.push(`/dashboard?storeId=${storeId}`); return; }
          const savedStepValue = status.onboardingStep || 1;
          const savedStep = REV_STEP_MAP[savedStepValue] || "SYNC";
          setCurrentStep(savedStepValue >= 10 && !subActive ? "BILLING" : savedStep);
          if (status.aiTone) {
            setSelectedTone(status.aiTone.charAt(0).toUpperCase() + status.aiTone.slice(1).replace("_", " "));
          }
          if (savedStepValue > 1) { setSyncProgress(100); setIsSyncComplete(true); }
        }
      } catch (err) {
        console.error("Init failed", err);
        hasInitialized.current = false;
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, [storeId, router]);

  const changeStep = async (newStep: Step) => {
    if (!storeId) return;
    setCurrentStep(newStep);
    try { await updateWizardStep(storeId, STEP_MAP[newStep]); } catch (err) { console.error("Step update failed", err); }
  };

  // Sync animation
  useEffect(() => {
    if (isInitializing || currentStep !== "SYNC") return;
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setIsSyncComplete(true); return 100; }
        return Math.min(prev + Math.random() * 14, 100);
      });
    }, 900);
    return () => clearInterval(interval);
  }, [currentStep, isInitializing]);

  const handleStartTrial = async () => {
    if (!storeId) return;
    setIsProcessingCheckout(true);
    setBillingError("");
    try {
      const res = await activateTrial(storeId);
      if (res.ok) { setCurrentStep("SUCCESS"); }
      else { setBillingError("Trial activation failed. Please try again."); }
    } catch (err) {
      console.error("Trial failed", err);
      setBillingError("Something went wrong. Please try again.");
    } finally { setIsProcessingCheckout(false); }
  };

  const handlePaidCheckout = async () => {
    if (!storeId) return;
    router.push(`/dashboard/billing?storeId=${storeId}`);
  };

  const handleFinish = async () => {
    if (!storeId) return;
    setIsFinishing(true);
    try {
      const res = await completeWizard(storeId, selectedTone);
      if (res.ok) { router.push(`/dashboard?storeId=${storeId}`); router.refresh(); }
      else { setIsFinishing(false); }
    } catch (err) { console.error("Finish failed", err); setIsFinishing(false); }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Sparkles className="text-white" size={16} fill="currentColor" />
          </div>
          <Loader2 className="animate-spin text-slate-300" size={28} />
          <p className="text-[13px] font-bold text-slate-400 tracking-tight">Loading your setup...</p>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 44;

  return (
    <OnboardingShell maxWidth="max-w-[560px]">
      <OnboardingProgress steps={["Welcome", "Connect Store", "Activate Plan"]} currentStep={2} />

      {webhookStatus === "partial_failure" && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={17} />
          <div>
            <p className="text-[13px] font-bold text-amber-900">Background Setup in Progress</p>
            <p className="text-[12px] text-amber-700 font-medium mt-0.5">Some store webhooks are taking longer than usual. Neryn will retry automatically.</p>
          </div>
        </motion.div>
      )}

      {/* Brand header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-[8px] bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/25">
            <Sparkles className="text-white" size={13} fill="currentColor" />
          </div>
          <span className="text-[18px] font-bold text-slate-900 tracking-tight">Neryn</span>
        </div>
        <p className="text-slate-400 font-medium text-[14px]">Powering your automated Shopify sales.</p>
      </div>

      <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
        <CardContent className="p-10 md:p-14">
          <WizardStepDots current={currentStep} />

          {/* ── SYNC ── */}
          {currentStep === "SYNC" && (
            <div className="space-y-8 text-center">
              <div className="relative mx-auto w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none"
                    stroke={syncProgress >= 100 ? "#10b981" : "#0f172a"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - syncProgress / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{Math.floor(syncProgress)}%</span>
                </div>
              </div>

              <div className="space-y-3 text-left">
                {SYNC_ITEMS.map(item => {
                  const done = syncProgress >= item.threshold;
                  return (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: done ? 1 : 0.35, x: 0 }} className="flex items-center gap-3">
                      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300")}>
                        {done ? <CheckCircle2 size={14} /> : item.icon}
                      </div>
                      <span className={cn("text-[13px] font-bold flex-1 transition-colors", done ? "text-slate-700" : "text-slate-300")}>{item.label}</span>
                      {!done && syncProgress > 5 && <Loader2 size={12} className="text-slate-300 animate-spin" />}
                    </motion.div>
                  );
                })}
              </div>

              <Button onClick={() => changeStep("TONE")} disabled={!isSyncComplete}
                className={cn("w-full h-14 text-base font-bold rounded-2xl transition-all",
                  isSyncComplete ? "bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
                {isSyncComplete
                  ? <span className="flex items-center gap-2">Choose AI Persona <ArrowRight size={16} /></span>
                  : <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Syncing store data...</span>}
              </Button>
            </div>
          )}

          {/* ── TONE ── */}
          {currentStep === "TONE" && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Choose AI Persona</h2>
                <p className="text-slate-500 font-medium text-[14px]">Define how Neryn represents your brand.</p>
              </div>

              <div className="grid gap-3">
                {TONES.map(tone => {
                  const selected = selectedTone === tone.name;
                  return (
                    <motion.button key={tone.name} layout onClick={() => setSelectedTone(tone.name)}
                      className={cn("w-full text-left p-5 rounded-[20px] border-2 transition-all duration-300",
                        selected ? tone.accent : "border-slate-100 bg-white hover:border-slate-200")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                          selected ? `${tone.iconActive} text-white shadow-lg` : "bg-slate-100 text-slate-400")}>
                          {tone.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-[14px]">{tone.name}</p>
                          <p className="text-[12px] text-slate-500 font-medium">{tone.desc}</p>
                        </div>
                        <div className={cn("h-5 w-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center",
                          selected ? "border-slate-900 bg-slate-900" : "border-slate-200")}>
                          {selected && <CheckCircle2 className="text-white p-0.5" size={16} />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {selected && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                            <div className="mt-4 pt-4 border-t border-slate-200/60">
                              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5">Sample response:</p>
                              <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic">"{tone.preview}"</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>

              <Button onClick={() => changeStep("PREVIEW")}
                className="w-full h-14 text-base font-bold rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10">
                <span className="flex items-center gap-2">Experience the Agent <ArrowRight size={16} /></span>
              </Button>
            </div>
          )}

          {/* ── PREVIEW ── */}
          {currentStep === "PREVIEW" && (() => {
            const conv = PREVIEW_CONVERSATIONS[selectedTone] ?? PREVIEW_CONVERSATIONS.Professional;
            return (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Live Preview</h2>
                  <p className="text-slate-500 font-medium text-[14px]">
                    How Neryn responds in <strong className="text-slate-700">{selectedTone}</strong> mode.
                  </p>
                </div>

                <div className={cn("rounded-[24px] border p-6 space-y-4", conv.color)}>
                  <div className="flex justify-end">
                    <div className="bg-white rounded-[16px] rounded-tr-[4px] px-4 py-3 max-w-[80%] shadow-sm border border-slate-100">
                      <p className="text-[13px] font-medium text-slate-700">"{conv.question}"</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Shopper</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={13} className="text-white" fill="currentColor" />
                      </div>
                      <div>
                        <div className="bg-white rounded-[16px] rounded-tl-[4px] px-4 py-3 shadow-sm border border-slate-100">
                          <p className="text-[13px] font-medium text-slate-700 leading-relaxed">"{conv.answer}"</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 ml-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Neryn · {conv.badge}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => changeStep("TONE")}
                    className="flex-1 h-12 font-bold rounded-2xl border-slate-200 text-slate-500 hover:text-slate-900 text-[12px] uppercase tracking-widest">
                    <ArrowLeft size={13} className="mr-2" /> Change Persona
                  </Button>
                  <Button onClick={() => changeStep("BILLING")}
                    className="flex-[2] h-12 font-bold rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10 text-[14px]">
                    Activate Plan <ArrowRight size={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* ── BILLING ── */}
          {currentStep === "BILLING" && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Activate Neryn</h2>
                <p className="text-slate-500 font-medium text-[14px]">Choose how you'd like to start.</p>
              </div>

              <div className="border-2 border-slate-900 rounded-[28px] p-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                        <Sparkles size={10} fill="currentColor" /> Best way to start
                      </span>
                      <h3 className="text-lg font-bold">7-Day Free Trial</h3>
                      <p className="text-slate-400 font-medium text-[13px] mt-0.5">Full access. No credit card required.</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-black tracking-tighter">$0</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">for 7 days</p>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {["All features unlocked", "Catalog sync + AI training", "24/7 agent live on storefront", "Cancel before trial ends — pay nothing"].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleStartTrial} disabled={isProcessingCheckout}
                    className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl shadow-2xl text-[15px]">
                    {isProcessingCheckout
                      ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Activating...</span>
                      : "Start Free Trial — No Card Needed"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">or skip trial</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="border border-slate-200 rounded-[28px] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">Choose Your Plan</h3>
                    <p className="text-[12px] text-slate-500 font-medium">Neryn Assist, Manage, or Desk plans.</p>
                  </div>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">from $49<span className="text-[13px] font-bold text-slate-400">/mo</span></p>
                </div>
                <Button onClick={handlePaidCheckout} disabled={isProcessingCheckout} variant="outline"
                  className="w-full h-12 border-slate-200 font-bold rounded-2xl text-slate-600 hover:text-slate-900 hover:border-slate-400 text-[13px]">
                  {isProcessingCheckout
                    ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                    : "View Plans & Start Trial"}
                </Button>
              </div>

              {billingError && (
                <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-red-700 font-medium">{billingError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <ShieldCheck size={13} className="text-emerald-500" /> Secured by Shopify
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <CheckCircle2 size={13} className="text-emerald-500" /> Cancel anytime
                </div>
              </div>

              <Button onClick={() => changeStep("PREVIEW")} variant="ghost"
                className="w-full h-10 text-slate-400 hover:text-slate-700 font-bold text-[12px] uppercase tracking-widest">
                <ArrowLeft size={13} className="mr-2" /> Back to Preview
              </Button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {currentStep === "SUCCESS" && (
            <div className="space-y-7 text-center py-4">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="mx-auto w-28 h-28 relative">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
                <div className="relative w-28 h-28 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={52} className="text-emerald-500" strokeWidth={1.5} />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                <h2 className="text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
                  Neryn is live on<br />your storefront!
                </h2>
                <p className="text-slate-500 font-medium text-[15px] leading-relaxed max-w-[320px] mx-auto">
                  Your AI sales agent is synced, trained, and ready to convert shoppers — 24/7.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2">
                {[
                  { icon: <Package size={12} />, text: "Catalog Synced" },
                  { icon: <Sparkles size={12} />, text: `${selectedTone} Persona` },
                  { icon: <Zap size={12} />, text: "Agent Active" },
                  { icon: <ShieldCheck size={12} />, text: "Trial Activated" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600">
                    <span className="text-emerald-500">{item.icon}</span> {item.text}
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-3">
                <Button onClick={handleFinish} disabled={isFinishing}
                  className="w-full h-14 text-base font-bold rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/10">
                  {isFinishing
                    ? <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Opening your dashboard...</span>
                    : <span className="flex items-center gap-2">Enter Neryn Dashboard <ArrowRight size={16} /></span>}
                </Button>
                <p className="text-[12px] text-slate-400 font-medium">
                  Your 7-day trial has started. We'll remind you before it ends.
                </p>
              </motion.div>
            </div>
          )}

        </CardContent>
      </Card>
    </OnboardingShell>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <Sparkles className="text-white" size={16} fill="currentColor" />
          </div>
          <Loader2 className="animate-spin text-slate-300" size={28} />
          <p className="text-[13px] font-bold text-slate-400 tracking-tight">Loading your setup...</p>
        </div>
      </div>
    }>
      <WizardPageContent />
    </Suspense>
  );
}
