export function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/50 px-8 py-12 text-center">
      {icon ? (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      ) : null}
      <p className="text-[15px] font-bold text-slate-900">{title}</p>
      {subtitle ? (
        <p className="mt-1 max-w-xs text-[13px] font-medium text-slate-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
