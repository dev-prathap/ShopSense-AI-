export function ProgressLine({
  steps,
  active
}: {
  steps: string[];
  active: number;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {steps.map((step, idx) => {
        const on = idx <= active;
        return (
          <div key={step} className="rounded-md border px-3 py-2">
            <p className={`text-xs font-semibold ${on ? "text-primary" : "text-muted-foreground"}`}>{step}</p>
          </div>
        );
      })}
    </div>
  );
}
