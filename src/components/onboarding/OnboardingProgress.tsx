"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  steps: string[];
  currentStep: number;
}

export function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-start px-2">
      {steps.map((label, i) => {
        const isActive = currentStep === i;
        const isCompleted = currentStep > i;

        return (
          <React.Fragment key={label}>
            {/* Step column */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 w-[72px]">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-300"
                )}
              >
                {isCompleted
                  ? <CheckCircle2 size={18} strokeWidth={2.5} />
                  : <span className="text-[13px] font-bold">{i + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.12em] text-center leading-tight",
                  isActive
                    ? "text-slate-900"
                    : isCompleted
                      ? "text-emerald-600"
                      : "text-slate-300"
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line — sibling between step columns */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mt-5 mx-2 rounded-full transition-colors duration-500",
                  isCompleted ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
