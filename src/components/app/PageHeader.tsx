export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
