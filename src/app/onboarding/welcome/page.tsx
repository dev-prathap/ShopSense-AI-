"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target, BarChart3, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Connect Store", "Activate Plan"];

const FEATURES = [
  {
    icon: <Zap size={18} />,
    bg: "bg-blue-50 text-blue-600",
    title: "Autonomous Sales Agent",
    desc: "Handles product questions, cart adds, and recommendations 24/7."
  },
  {
    icon: <Target size={18} />,
    bg: "bg-violet-50 text-violet-600",
    title: "Catalog-Aware Intelligence",
    desc: "Trained on your live inventory, policies, and pricing — always current."
  },
  {
    icon: <BarChart3 size={18} />,
    bg: "bg-emerald-50 text-emerald-600",
    title: "Revenue Attribution",
    desc: "See exactly which conversations drove purchases and how much."
  }
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push("/onboarding/connect");
  };

  return (
    <OnboardingShell>
      <OnboardingProgress steps={STEPS} currentStep={0} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-10 md:p-14">

            {/* Neryn brand header */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-9 w-9 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                  <Sparkles className="text-white" size={16} fill="currentColor" />
                </div>
                <span className="text-[22px] font-bold text-slate-900 tracking-tight">Neryn</span>
              </div>

              {/* Shopify partner badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f0f7e8] border border-[#c5e098] rounded-full mb-8">
                <img src="/shopify/glyph.svg" className="h-3.5 w-3.5" alt="" />
                <span className="text-[11px] font-bold text-[#3d7a1a] uppercase tracking-widest">
                  Shopify AI Partner
                </span>
              </div>

              <h1 className="text-[30px] font-bold text-slate-900 tracking-tight leading-[1.1] mb-3">
                Your AI sales agent<br />is ready to activate
              </h1>
              <p className="text-slate-500 font-medium text-[15px] leading-relaxed max-w-[380px]">
                Connect your store in 3 steps. Neryn handles every shopper conversation automatically.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid gap-3 mb-10">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className={cn("flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center mt-0.5", f.bg)}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-[14px]">{f.title}</p>
                    <p className="text-[13px] text-slate-500 font-medium leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-5 mb-7">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span className="text-[12px] font-bold text-slate-400">~5 minutes</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i + 20}`}
                    className="h-6 w-6 rounded-full border-2 border-white shadow-sm" alt="" />
                ))}
              </div>
              <span className="text-[12px] font-bold text-slate-400">
                <span className="text-slate-700">450+</span> stores live
              </span>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full h-14 text-base font-bold rounded-2xl bg-slate-900 hover:bg-black text-white transition-all shadow-xl shadow-slate-900/10"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Let's Get Started <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
              <p className="text-center text-[11px] text-slate-400 font-medium mt-3">
                <ShieldCheck size={12} className="inline mr-1 text-emerald-500" />
                No credit card required. Cancel anytime.
              </p>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </OnboardingShell>
  );
}
