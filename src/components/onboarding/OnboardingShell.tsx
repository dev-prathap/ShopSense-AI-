"use client";

import { motion } from "motion/react";

interface OnboardingShellProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export function OnboardingShell({ children, maxWidth = "max-w-[600px]" }: OnboardingShellProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-6 bg-[#fafafa]">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-50/60 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-50/60 blur-[130px] rounded-full" />
      </div>

      {/* Content */}
      <motion.div
        className={`relative z-10 w-full ${maxWidth} space-y-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>

      {/* Footer */}
      <div className="relative z-10 flex justify-center gap-6 mt-10 text-[11px] font-bold text-slate-400">
        <a href="/terms" className="hover:text-slate-900 transition-colors">Terms</a>
        <a href="mailto:support@neryn.ai" className="hover:text-slate-900 transition-colors">Support</a>
        <a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
      </div>
    </main>
  );
}
