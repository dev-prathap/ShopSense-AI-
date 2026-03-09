import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function AuthShell(props: {
  title: string;
  subtitle: string;
  children: ReactNode;
  sideTitle: string;
  sideBody: string;
}) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="relative hidden bg-linear-to-br from-slate-950 via-slate-900 to-teal-900 p-16 text-white md:flex md:flex-col md:justify-between lg:p-24">
        <div className="space-y-8">
          <Badge className="w-fit bg-white/20 px-4 py-1 text-sm text-white hover:bg-white/20">AI Sales Agent</Badge>
          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight lg:text-7xl">{props.sideTitle}</h2>
            <p className="max-w-lg text-xl text-white/70 leading-relaxed">{props.sideBody}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Shopify-native setup", icon: "🚀" },
            { label: "Revenue attribution", icon: "📊" },
            { label: "RBAC + JWT sessions", icon: "🔐" },
            { label: "24/7 sales agent", icon: "🤖" }
          ].map((item) => (
            <div key={item.label} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-card p-12 md:p-16 lg:p-24">
        <div className="w-full max-w-lg space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{props.title}</h1>
            <p className="text-xl text-muted-foreground">{props.subtitle}</p>
          </div>
          <div className="rounded-3xl border bg-card/50 p-1 backdrop-blur-sm">
            <div className="space-y-8 p-1">
              {props.children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
