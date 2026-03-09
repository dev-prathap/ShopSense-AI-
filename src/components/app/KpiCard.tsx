import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  note
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <Card className="surface-elevated motion-micro">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="type-h2">{value}</CardTitle>
      </CardHeader>
      {note ? <CardContent className="pt-0 text-xs text-muted-foreground">{note}</CardContent> : null}
    </Card>
  );
}
