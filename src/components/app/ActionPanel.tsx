export function ActionPanel({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card motion-enter rounded-2xl p-6 border-slate-200/60 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {description ? <p className="text-[15px] font-medium text-slate-500 mt-1">{description}</p> : null}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
