"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Package,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { completeWizard, updateWizardStep, getWizardStatus, activateTrial, activatePaid } from "./actions";

type Step = "SYNC" | "TONE" | "PREVIEW" | "BILLING" | "SUCCESS";

const STEP_MAP: Record<Step, number> = {
  "SYNC": 1,
  "TONE": 2,
  "PREVIEW": 3,
  "BILLING": 4,
  "SUCCESS": 10
};

const REV_STEP_MAP: Record<number, Step> = {
  1: "SYNC",
  2: "TONE",
  3: "PREVIEW",
  4: "BILLING",
  10: "SUCCESS"
};

function WizardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const webhookStatus = searchParams.get("webhookStatus");

  const [currentStep, setCurrentStep] = useState<Step>("SYNC");
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState("Discovery in progress...");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);

  const hasInitialized = useRef(false);

  // Sync with DB
  useEffect(() => {
    if (!storeId && !isInitializing) {
      router.push("/dashboard/connect");
      return;
    }

    if (!storeId || hasInitialized.current) return;
    hasInitialized.current = true;

    async function init() {
      try {
        const status = await getWizardStatus(storeId!);
        if (status) {
          const subActive = status.billingSubscription?.active || false;
          setHasActiveSub(subActive);

          // If onboarding is completed AND subscription is active, go to dashboard
          if (status.onboardingCompletedAt && subActive) {
             router.push(`/dashboard?storeId=${storeId}`);
             return;
          }

          // Otherwise, restore the saved step
          const savedStepValue = status.onboardingStep || 1;
          const savedStep = REV_STEP_MAP[savedStepValue] || "SYNC";
          
          // Force back to BILLING if we have step 10 but NO active sub
          if (savedStepValue >= 10 && !subActive) {
            setCurrentStep("BILLING");
          } else {
            setCurrentStep(savedStep);
          }
          
          if (status.aiTone) {
             setSelectedTone(status.aiTone.charAt(0).toUpperCase() + status.aiTone.slice(1).replace("_", " "));
          }
          
          if (savedStepValue > 1) {
             setSyncProgress(100);
             setIsSyncComplete(true);
          }
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

  // Handle step transitions and database persistence
  const changeStep = async (newStep: Step) => {
    if (!storeId) return;
    setCurrentStep(newStep);
    try {
      await updateWizardStep(storeId, STEP_MAP[newStep]);
    } catch (err) {
      console.error("Step update failed", err);
    }
  };

  const handleStartTrial = async () => {
    if (!storeId) return;
    setIsProcessingCheckout(true);
    try {
      const res = await activateTrial(storeId);
      if (res.ok) {
        setHasActiveSub(true);
        setCurrentStep("SUCCESS");
      }
    } catch (error) {
      console.error("Trial activation failed", error);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handlePaidCheckout = async () => {
    if (!storeId) return;
    setIsProcessingCheckout(true);
    try {
      const res = await activatePaid(storeId);
      if (res.ok) {
        setHasActiveSub(true);
        setCurrentStep("SUCCESS");
      }
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleFinish = async () => {
    if (!storeId) return;
    setIsFinishing(true);
    try {
      const res = await completeWizard(storeId, selectedTone);
      if (res.ok) {
        router.push(`/dashboard?storeId=${storeId}`);
        router.refresh();
      } else {
        setIsFinishing(false);
      }
    } catch (err) {
      console.error("Finish failed", err);
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;
    if (currentStep === "SYNC") {
      const interval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSyncStatus("Store intelligence mapped!");
            setIsSyncComplete(true);
            return 100;
          }
          const next = prev + Math.random() * 15;
          if (next > 30 && next < 60) setSyncStatus("Scraping store policies...");
          if (next > 60 && next < 90) setSyncStatus("Training AI models...");
          if (next > 90) setSyncStatus("Finalizing agent persona...");
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, isInitializing]);

  const tones = [
    { name: "Professional", desc: "Expert, trustworthy, and precise.", icon: <ShieldCheck size={18} /> },
    { name: "Friendly", desc: "Approachable, warm, and helpful.", icon: <MessageSquare size={18} /> },
    { name: "Luxury", desc: "Premium, sophisticated, and exclusive.", icon: <Sparkles size={18} /> }
  ];

  if (isInitializing) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-slate-400" size={32} />
            <p className="text-slate-400 font-medium tracking-tight">Restoring session...</p>
          </div>
       </div>
     );
  }

  return (
    <main className="relative min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[560px] space-y-8">
        {webhookStatus === "partial_failure" && (
           <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
             <AlertCircle className="text-amber-600 mt-1 shrink-0" size={18} />
             <div className="space-y-1">
                <p className="text-[13px] font-bold text-amber-900">Background Setup in Progress</p>
                <p className="text-[12px] text-amber-700 font-medium">Some store webhooks are taking longer than usual to register. Neryn will automatically retry this in the background.</p>
             </div>
           </div>
        )}

        <div className="text-center space-y-4">
          <div className="relative h-16 w-16 mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-[#95BF47] flex items-center justify-center text-white shadow-xl shadow-[#95BF47]/20 rotate-3 transition-transform hover:rotate-0">
               <img src="/shopify/glyph.svg" alt="Shopify" className="h-9 w-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-lg border-2 border-white">
              <Sparkles size={14} fill="currentColor" />
            </div>
          </div>
          <div className="space-y-1">
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activate Neryn AI</h1>
             <p className="text-slate-400 font-medium text-[15px]">Powering your automated Shopify sales.</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          {["Sync", "Tone", "Test", "Billing"].map((label, i) => {
            const steps: Step[] = ["SYNC", "TONE", "PREVIEW", "BILLING"];
            const isActive = steps.indexOf(currentStep) === i;
            const isCompleted = steps.indexOf(currentStep) > i || currentStep === "SUCCESS";
            
            return (
              <div key={label} className="flex flex-col items-center gap-3 relative">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive ? "border-slate-900 bg-slate-900 text-white shadow-lg" : 
                  isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : 
                  "border-slate-200 bg-white text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <span className="text-[13px] font-bold">{i + 1}</span>}
                </div>
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.15em] transition-colors",
                  isActive ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-300"
                )}>{label}</span>
              </div>
            );
          })}
        </div>

        <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-10 md:p-14">
            {currentStep === "SYNC" && (
              <div className="space-y-10 text-center">
                <div className="relative mx-auto w-32 h-32">
                   <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
                   <div className="absolute inset-0 rounded-full border-[3px] border-slate-900 border-t-transparent animate-spin" style={{ animationDuration: '2s' }} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-white rounded-2xl shadow-md border border-slate-50 flex items-center justify-center">
                         <Loader2 className="animate-spin text-slate-900" size={28} />
                      </div>
                   </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{Math.floor(syncProgress)}% Complete</h2>
                  <p className="text-slate-500 font-medium text-[15px]">{syncStatus}</p>
                </div>
                <Progress value={syncProgress} className="h-1.5 bg-slate-50 border-none" />
                <div className="flex justify-center gap-8 pt-2">
                   <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest"><Package size={14} /> Products</div>
                   <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest"><FileText size={14} /> Policies</div>
                </div>
                <Button 
                  onClick={() => changeStep("TONE")}
                  disabled={!isSyncComplete}
                  className="w-full h-16 text-lg font-bold rounded-2xl bg-slate-900 hover:bg-black text-white transition-all shadow-xl shadow-slate-200"
                >
                  {isSyncComplete ? "Set AI Persona" : "Initializing Sync..."}
                </Button>
              </div>
            )}

            {currentStep === "TONE" && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Choose AI Persona</h2>
                  <p className="text-slate-500 font-medium">Define how Neryn represents your brand.</p>
                </div>
                <div className="grid gap-4">
                  {tones.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => setSelectedTone(tone.name)}
                      className={cn(
                        "flex items-center gap-5 p-5 rounded-[24px] border-2 text-left transition-all duration-300",
                        selectedTone === tone.name ? "border-slate-900 bg-slate-50 shadow-inner" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "h-11 w-11 rounded-2xl flex items-center justify-center transition-colors",
                        selectedTone === tone.name ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-100 text-slate-400"
                      )}>
                        {tone.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-[15px]">{tone.name}</p>
                        <p className="text-[13px] text-slate-500 font-medium">{tone.desc}</p>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 transition-all",
                        selectedTone === tone.name ? "border-slate-900 bg-slate-900" : "border-slate-200"
                      )}>
                        {selectedTone === tone.name && <CheckCircle2 className="text-white p-0.5" size={16} />}
                      </div>
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={() => changeStep("PREVIEW")}
                  className="w-full h-16 text-lg font-bold rounded-2xl bg-slate-900 hover:bg-black text-white transition-all shadow-xl shadow-slate-200"
                >
                  Experience the Agent
                </Button>
              </div>
            )}

            {currentStep === "PREVIEW" && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Simulation Active</h2>
                  <p className="text-slate-500 font-medium px-4">Watch how your agent handles a standard inquiry with {selectedTone} tone.</p>
                </div>
                <div className="rounded-[32px] border border-slate-100 bg-[#fcfcfc] p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-14 w-14 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-50 text-slate-900">
                    <Zap size={28} fill="currentColor" className="text-blue-500" />
                  </div>
                  <div className="space-y-4">
                     <p className="text-[15px] font-medium text-slate-700 leading-relaxed italic max-w-xs mx-auto">"Hello! I noticed you were looking at the Summer Collection. Can I help you find your size?"</p>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedTone} active</span>
                     </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => changeStep("TONE")} className="flex-1 h-16 font-bold rounded-2xl border-slate-200 text-slate-500 uppercase tracking-widest text-[11px]">Back</Button>
                  <Button onClick={() => changeStep("BILLING")} className="flex-2 h-16 font-bold rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">Final Step: Billing</Button>
                </div>
              </div>
            )}

            {currentStep === "BILLING" && (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">Activate Neryn</h2>
                  <p className="text-slate-500 font-medium">Power up your store with 24/7 AI sales agents.</p>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />
                  <div className="relative z-10 flex flex-col space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className="bg-white text-slate-900 border-none font-bold text-[10px] uppercase px-2 py-0.5">7-DAY TRIAL</Badge>
                        <h3 className="text-xl font-bold mt-2">Neryn Professional</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold tracking-tighter">$100</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">per month</p>
                      </div>
                    </div>
                    <ul className="space-y-4 text-[13px] font-medium text-slate-400">
                      {["Autonomous Catalog Engagement", "Dynamic Yield Generation", "Smart Cart Recovery", "24/7 Multi-language Support"].map(f => (
                        <li key={f} className="flex items-center gap-3">
                          <CheckCircle2 className="text-emerald-500" size={14} /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-3">
                       <Button 
                        onClick={handleStartTrial} 
                        disabled={isProcessingCheckout}
                        className="w-full h-16 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-2xl transition-all"
                       >
                         {isProcessingCheckout ? (
                           <div className="flex items-center gap-3"><Loader2 className="h-4 w-4 animate-spin text-slate-900" /> Activating...</div>
                         ) : "Start 7-Day Free Trial"}
                       </Button>
                       <Button 
                        onClick={handlePaidCheckout} 
                        disabled={isProcessingCheckout} 
                        variant="outline" 
                        className="w-full h-16 border-2 border-slate-700 bg-transparent hover:bg-slate-800 text-white font-bold rounded-2xl transition-all"
                       >
                         {isProcessingCheckout ? (
                           <div className="flex items-center gap-3"><Loader2 className="h-4 w-4 animate-spin text-white" /> Processing...</div>
                         ) : "Pay $100 Now"}
                       </Button>
                    </div>
                    <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Secure Checkout by Creem.io</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "SUCCESS" && (
              <div className="space-y-10 text-center py-4">
                <div className="mx-auto w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner border border-emerald-100 animate-in zoom-in duration-700">
                  <ShieldCheck size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Setup Complete</h2>
                  <p className="text-slate-500 font-medium px-4 text-[15px] leading-relaxed">Your store intelligence is synced. Neryn is ready to scale your Shopify storefront.</p>
                </div>
                <Button onClick={handleFinish} disabled={isFinishing} className="w-full h-16 text-lg font-bold rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200">
                  {isFinishing ? <div className="flex items-center gap-3"><Loader2 className="h-5 w-5 animate-spin" /> Finalizing...</div> : <div className="flex items-center gap-2">Enter Command Center <ArrowRight className="h-5 w-5" /></div>}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WizardPageContent />
    </Suspense>
  );
}
