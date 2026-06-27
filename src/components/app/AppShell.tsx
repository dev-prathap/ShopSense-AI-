import { cn } from "@/lib/utils";
import {
  BarChart3,
  Settings2,
  CreditCard,
  MessageSquare,
  BrainCircuit,
  Bell,
  Search,
  LogOut,
  Users,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  active?: boolean;
};

const iconMap: Record<string, any> = {
  Insights: BarChart3,
  Knowledge: BrainCircuit,
  Conversations: MessageSquare,
  Configuration: Settings2,
  Team: Users,
  Plan: CreditCard,
};

function initialsFrom(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "·";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function AppShell({
  storeId,
  children,
  nav,
  shopDomain,
  user,
  hasNotifications = false,
}: {
  storeId: string;
  children: React.ReactNode;
  nav: Item[];
  /** Human-readable store label; falls back to storeId when absent. */
  shopDomain?: string;
  /** Signed-in user for the header; falls back to a generic label. */
  user?: { name?: string | null; email?: string | null };
  /** Show the notification dot only when there is real activity. */
  hasNotifications?: boolean;
}) {
  const storeLabel = shopDomain
    ? shopDomain.replace(/\.myshopify\.com$/, "")
    : storeId;
  const displayName = user?.name || user?.email || "Account";

  return (
    <div className="flex min-h-screen bg-[#fafafe]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[240px] border-r border-slate-100 bg-white md:block">
        <div className="flex h-full flex-col px-3.5 py-5">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-3 pb-6 pt-1">
            <div className="grid h-6 w-6 grid-cols-2 gap-[3px]">
              <span className="rounded-[3px] bg-blue-600" />
              <span className="rounded-[3px] bg-blue-400" />
              <span className="rounded-[3px] bg-blue-400" />
              <span className="rounded-[3px] bg-blue-600" />
            </div>
            <span className="text-[18px] font-extrabold tracking-tight text-slate-900">
              Neryn
            </span>
          </div>

          {/* Nav */}
          <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto">
            {nav.map((item) => {
              const Icon = iconMap[item.label] || BarChart3;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                    item.active
                      ? "bg-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.6)]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    size={19}
                    strokeWidth={2}
                    className={cn(
                      item.active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-600"
                    )}
                  />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="space-y-3 pt-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Store Health
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold text-slate-900">
                {storeLabel}
              </p>
            </div>
            <a
              href="/api/auth/logout"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={17} strokeWidth={2} />
              Log Out
            </a>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative flex min-h-screen flex-1 flex-col md:pl-[240px]">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-160px] h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]"
        />

        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100/60 bg-white/70 px-8 backdrop-blur-xl">
          <div className="hidden w-full max-w-[300px] lg:block">
            <div className="group relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"
                size={15}
              />
              <input
                type="text"
                placeholder="Search conversations, settings…"
                className="w-full rounded-xl border border-slate-100 bg-white py-2 pl-10 pr-4 text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-5">
            <button
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition-all hover:border-blue-100 hover:text-blue-600 hover:shadow-sm"
            >
              <Bell size={17} />
              {hasNotifications && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <div className="flex items-center gap-2.5">
              <span className="hidden text-[13px] font-semibold text-slate-800 sm:block">
                {displayName}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                {initialsFrom(user?.name, user?.email)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="relative mx-auto w-full max-w-6xl flex-1 p-8">
          {children}
        </section>
      </div>
    </div>
  );
}
