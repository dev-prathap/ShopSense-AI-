import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Settings2, 
  CreditCard, 
  MessageSquare, 
  BrainCircuit, 
  Store, 
  Bell,
  Search,
  LogOut,
  Sparkles,
  Users
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  active?: boolean;
};

const iconMap: Record<string, any> = {
  "Insights": BarChart3,
  "Knowledge": BrainCircuit,
  "Conversations": MessageSquare,
  "Configuration": Settings2,
  "Team": Users, // Changed icon for Team from Store to Users
  "Plan": CreditCard
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
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Minimal Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r border-slate-100 transition-all duration-300 md:block hidden">
        <div className="flex h-full flex-col">
          {/* Brand/Logo Section */}
          <div className="flex h-16 items-center px-6 gap-2.5 mt-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Sparkles className="text-white" size={16} fill="currentColor" />
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-[17px]">ShopSense</span>
          </div>

          {/* Navigation - Minimalist */}
          <nav className="flex-1 space-y-0.5 px-3 py-6 overflow-y-auto custom-scrollbar">
            {nav.map((item) => {
              const Icon = iconMap[item.label] || BarChart3;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13.5px] font-bold tracking-wide transition-all duration-200",
                    item.active 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/25" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon size={18} strokeWidth={2.5} className={cn(item.active ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Bottom section - Minimal */}
          <div className="p-3 mb-4">
             <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100/50 mb-3">
                <div className="flex items-center gap-2.5 mb-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Health</span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 truncate">{storeId}</p>
             </div>
            <a 
              href="/api/auth/logout"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut size={16} strokeWidth={2.5} />
              Log Out
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-[240px] flex flex-col min-h-screen">
        {/* Top Header - Ultra Minimal */}
        <header className="sticky top-0 z-40 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-100/60 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
             <div className="relative max-w-[300px] w-full hidden lg:block group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={15} />
                <input 
                  type="text" 
                  placeholder="Search settings..." 
                  className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
                />
             </div>
          </div>
          
          <div className="flex items-center gap-5">
             <button className="h-9 w-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-sm transition-all relative">
                <Bell size={17} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
             </button>
             
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">Admin</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Settings</p>
                </div>
                <div className="h-9 w-9 rounded-[12px] bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs">
                  AD
                </div>
             </div>
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 p-8 max-w-6xl mx-auto w-full">
          {children}
        </section>
      </div>
    </div>
  );
}
