import { cn } from "@/lib/utils";

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "error" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "error" && "border-red-200 bg-red-50 text-red-700",
        tone === "neutral" && "border-border bg-white text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}
