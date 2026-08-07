"use client";

import { ToggleRight, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openThemeEditor } from "@/lib/shopify/theme-extension";

/**
 * Replaces the "Live Integration" panel, which printed a <script> block and
 * told the merchant to "inject this script just before the closing </body> tag
 * of your theme".
 *
 * App Store review rejected exactly that (ref 108334): "Injecting code to theme
 * editor is not allowed." The reviewer had followed the instruction, pasted the
 * snippet into theme.liquid, and still had no widget — because the snippet was
 * malformed. It was written as a template literal inside JSX, so `"${storeId}"`
 * rendered as a literal `"$` followed by the interpolated value, producing
 * src="$https://neryn.pro/widget.js". The copy button had no handler either.
 *
 * None of that needs fixing, because none of it should exist: the widget is a
 * theme app extension now and the merchant switches it on in their theme.
 */
const STEPS = [
  "Open your theme editor",
  "Find Neryn AI Sales Agent under App embeds",
  "Switch it on and hit Save"
];

export function ThemeEmbedPanel({ shopDomain }: { shopDomain: string }) {
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-slate-300">
              {i + 1}
            </span>
            <span className="text-[13px] font-medium leading-relaxed text-slate-300">
              {step}
            </span>
          </li>
        ))}
      </ol>

      <Button
        onClick={() => openThemeEditor(shopDomain)}
        className="h-12 w-full rounded-xl bg-white text-[13px] font-bold text-slate-900 transition-all hover:bg-slate-100"
      >
        <span className="flex items-center gap-2">
          <ToggleRight size={16} /> Open theme editor <ArrowUpRight size={14} />
        </span>
      </Button>

      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
        <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />
        <p className="text-[11.5px] font-medium leading-relaxed text-emerald-100/80">
          No code to paste and nothing to maintain in your theme. Neryn is removed
          cleanly when you uninstall the app.
        </p>
      </div>
    </div>
  );
}
