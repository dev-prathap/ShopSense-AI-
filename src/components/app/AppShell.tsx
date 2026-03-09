import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  active?: boolean;
};

export function AppShell({
  storeId,
  children,
  nav
}: {
  storeId: string;
  children: React.ReactNode;
  nav: Item[];
}) {
  return (
    <main className="surface-base min-h-screen">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div>
            <p className="type-title">AI Sales Agent</p>
            <p className="type-caption text-muted-foreground">Store: {storeId}</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "motion-micro rounded-full border px-3 py-1.5 text-sm",
                  item.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</section>
    </main>
  );
}
