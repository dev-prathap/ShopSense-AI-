export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="motion-enter flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="type-h1">{title}</h1>
        {subtitle ? <p className="type-body text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
