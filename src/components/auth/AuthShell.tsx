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
    <main className="grid min-h-screen bg-white text-slate-900 md:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-[#c7e0f4] bg-linear-to-br from-[#edf6fc] via-[#f7fbff] to-white p-16 text-slate-900 md:flex md:flex-col md:justify-between lg:p-24">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#0078D4]/22 blur-3xl animate-[spin_22s_linear_infinite]" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#50a9f8]/24 blur-3xl animate-[spin_30s_linear_infinite_reverse]" />
        <div className="space-y-8">
          <Badge className="w-fit border border-[#b4d6f3] bg-[#e5f1fb] px-4 py-1 text-sm text-[#005a9e] hover:bg-[#e5f1fb]">AI Sales Agent</Badge>
          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight lg:text-7xl">{props.sideTitle}</h2>
            <p className="max-w-lg text-xl text-slate-600 leading-relaxed">{props.sideBody}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Shopify-native setup", icon: "🚀" },
            { label: "Revenue attribution", icon: "📊" },
            { label: "RBAC + JWT sessions", icon: "🔐" },
            { label: "24/7 sales agent", icon: "🤖" }
          ].map((item) => (
            <div key={item.label} className="group flex items-center gap-3 rounded-2xl border border-[#d7e9f8] bg-white/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0078D4]/40 hover:shadow-md">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative flex items-center justify-center overflow-hidden bg-[#f8fafc] p-12 md:p-16 lg:p-24">
        <div className="w-full max-w-lg space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">{props.title}</h1>
            <p className="text-xl text-slate-500">{props.subtitle}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
            <div className="space-y-8 p-3 md:p-4">
              {props.children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
