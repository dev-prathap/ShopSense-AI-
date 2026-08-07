"use client";

import { ToggleRight, ArrowUpRight } from "lucide-react";
import { openThemeEditor } from "@/lib/shopify/theme-extension";

/**
 * The widget only appears once the merchant switches on Neryn's app embed in
 * their theme. Shopify deliberately gives apps no way to read whether an embed
 * is enabled, let alone enable it — so this cannot be a conditional banner, and
 * the honest version is a standing pointer to the switch.
 *
 * Without it the failure is silent: setup completes, the dashboard fills with
 * zeroes, and nothing explains why no shopper ever sees the assistant.
 */
export function WidgetEmbedReminder({ shopDomain }: { shopDomain: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <ToggleRight size={16} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-900">
            Widget not showing on your storefront?
          </p>
          <p className="text-[12px] font-medium leading-relaxed text-slate-500">
            Neryn appears once the <b>Neryn AI Sales Agent</b> app embed is switched on
            in your theme.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openThemeEditor(shopDomain)}
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-black"
      >
        Open theme editor <ArrowUpRight size={14} />
      </button>
    </div>
  );
}
