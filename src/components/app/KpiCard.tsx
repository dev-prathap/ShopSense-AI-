import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  note,
  trend,
  hero = false,
}: {
  label: string;
  value: string | number;
  note?: string;
  /** Only pass when a real period-over-period delta is available. */
  trend?: { value: string; positive: boolean };
  /** Hero KPIs get the gradient-clipped numerals; reserve for headline metrics. */
  hero?: boolean;
}) {
  if (hero) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-400/15 blur-2xl" />
        <div className="relative mb-3.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-500">{label}</span>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                trend.positive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        <div className="relative bg-linear-to-b from-blue-700 to-blue-500 bg-clip-text text-[38px] font-black leading-none tracking-[-0.04em] text-transparent">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-[18px] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mb-2 text-[13px] font-semibold text-slate-500">{label}</div>
      <div className="mb-1.5 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-slate-900">
        {value}
      </div>
      {note ? (
        <div className="text-[12px] font-medium text-slate-400">{note}</div>
      ) : null}
    </div>
  );
}
