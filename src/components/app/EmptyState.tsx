export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="type-title">{title}</p>
      {subtitle ? <p className="type-body text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
