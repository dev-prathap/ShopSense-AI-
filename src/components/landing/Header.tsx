"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-[3%] pt-[calc(3%+1rem)] md:pt-[calc(3%+1.5rem)] pb-2 pointer-events-none">
      <header 
        className={`pointer-events-auto flex items-center justify-between w-full max-w-[1200px] px-6 py-4 md:px-8 transition-all duration-300 rounded-full ${
          isScrolled 
            ? "bg-white/60 backdrop-blur-xl shadow-lg border border-slate-200/50 text-slate-900" 
            : "bg-white/10 backdrop-blur-sm text-slate-900 border border-slate-200/50"
        }`}
      >
        <a href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-0.5">
              <div className={`w-2.5 h-2.5 rounded-[2px] transition-colors bg-blue-600`} />
              <div className={`w-2.5 h-2.5 rounded-[2px] transition-colors bg-blue-600/40`} />
            </div>
            <div className="flex gap-0.5">
              <div className={`w-2.5 h-2.5 rounded-[2px] transition-colors bg-blue-600/40`} />
              <div className={`w-2.5 h-2.5 rounded-[2px] transition-colors bg-blue-600`} />
            </div>
          </div>
          <span className="font-extrabold text-[20px] tracking-tight text-slate-900">Neryn</span>
        </a>

        <nav className="hidden md:flex items-center gap-10 text-[15px] font-semibold">
          <a href="#how-it-works" className="transition-colors text-slate-700 hover:text-blue-600">How It Works</a>
          <a href="#pricing" className="transition-colors text-slate-700 hover:text-blue-600">Pricing</a>
          <a href="#integrations" className="transition-colors text-slate-700 hover:text-blue-600">Integrations</a>
          <a href="#faq" className="transition-colors text-slate-700 hover:text-blue-600">FAQ</a>
        </nav>

        <button className="hidden md:flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] font-bold transition-all shadow-md hover:scale-105 group bg-[#0f172a] text-white hover:bg-black" onClick={() => window.location.href = '/signup'}>
          Start Free Trial
          <span className="p-0.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 bg-white/10 text-white">
              <ArrowRight size={14} className="-rotate-45" strokeWidth={2.5} />
          </span>
        </button>
      </header>
    </div>
  );
}
