import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  note,
  trend
}: {
  label: string;
  value: string | number;
  note?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <Card className="glass-card motion-micro border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</CardDescription>
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">{value}</CardTitle>
          {trend && (
            <span className={`text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      </CardHeader>
      {note ? <CardContent className="pt-0 text-[13px] font-medium text-slate-400">{note}</CardContent> : null}
    </Card>
  );
}
