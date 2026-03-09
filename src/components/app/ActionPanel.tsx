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
    <section className="surface-elevated motion-enter rounded-xl border p-5">
      <div className="mb-4">
        <h2 className="type-title">{title}</h2>
        {description ? <p className="type-body text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
