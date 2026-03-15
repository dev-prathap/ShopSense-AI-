"use client";
import { motion } from "motion/react";
import { Bot } from "lucide-react";

export function Hero() {
  return (
    <section className="relative px-[2%] pt-[2%] w-full">
      <div className="relative pt-44 pb-0 px-4 md:px-8 flex flex-col items-center justify-start overflow-hidden min-h-[calc(100vh-3vw)] rounded-[32px] md:rounded-[48px] bg-[#f8f9fa] border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        {/* Gradient Background */}
        <div className="absolute inset-0 z-0 bg-linear-to-b from-[#e0e7ff] via-[#f8f9fa] to-[#f8f9fa]">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDE1djEwTTE1IDIwaDEwIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] bg-repeat"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#3b82f6]/10 blur-[120px] rounded-full pointer-events-none"></div>
        </div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full flex flex-col items-center text-center text-slate-900 mb-16"
        >
          <h1 className="text-5xl md:text-[64px] lg:text-[76px] font-bold tracking-tight mb-6 leading-[1.05] max-w-4xl text-slate-900">
            Automate your Shopify Sales<br className="hidden md:block" />with Neryn AI
          </h1>

          <p className="text-lg md:text-[20px] text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly engage customers, boost conversions, and provided 24/7 intelligent support—no code required.
          </p>

          <div className="relative w-full max-w-[420px] mx-auto bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/80 flex focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <input 
              type="email" 
              placeholder="Enter your store email" 
              className="flex-1 bg-transparent px-5 py-3 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <button onClick={() => window.location.href = '/signup'} className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-full transition-all shadow-md flex items-center justify-center whitespace-nowrap">
              Launch AI Agent
            </button>
          </div>
        </motion.div>

        {/* Central Graphic Area */}
        <div className="relative w-full max-w-[1000px] h-[550px] mt-4 z-10 pointer-events-none flex justify-center items-end">
          
          {/* Background Geometric Pattern */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 flex justify-center items-center pointer-events-none">
            <div className="absolute w-[300px] h-[300px] border-2 border-blue-600/40 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute w-[500px] h-[500px] border border-blue-600/30 rounded-full border-dashed animate-[spin_90s_linear_infinite_reverse]"></div>
            <div className="absolute w-[700px] h-[700px] border border-blue-600/20 rounded-full border-dashed animate-[spin_120s_linear_infinite]"></div>
            {/* Hexagon dots to mimic the provided image pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDVMMzUgMTRWMjZMMjAgMzVMMSAyNlYxNEwyMCA1WiIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] bg-center opacity-40 blur-[2px]" style={{ maskImage: 'radial-gradient(circle, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }}></div>
          </div>

          {/* Central Image (Woman on Phone) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-20 w-[450px] h-[550px]"
          >
            {/* Mask to fade out the bottom seamlessly */}
            <div className="w-full h-full" style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)' }}>
               <img 
                 src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHVzaW5nJTIwcGhvbmV8ZW58MHx8fHwxNzczNDgzMDEyfDA&ixlib=rb-4.1.0&q=80&w=800" 
                 alt="Professional using AI app"
                 className="w-full h-full object-cover object-top rounded-t-[200px]"
               />
            </div>
          </motion.div>

          {/* Floating Chat 1 (Middle Left) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-[35%] left-[5%] md:left-[15%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 -left-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-white shadow-sm">
                   <Bot size={16} className="text-blue-600" />
                </div>
                <span className="text-[12px] font-bold text-slate-500">Neryn AI</span>
             </div>
             <div className="bg-white/90 backdrop-blur-xl p-4 md:p-5 rounded-2xl rounded-tl-sm shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/60 max-w-[220px] md:max-w-[260px]">
                <p className="text-[13px] md:text-[14px] text-slate-700 font-medium leading-relaxed">
                   Based on Q3 data, enterprise subscriptions are up by 18% in the EMEA region.
                </p>
             </div>
          </motion.div>

          {/* Floating Chat 2 (Top Right) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute top-[25%] right-[5%] md:right-[15%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 right-0 flex flex-row-reverse items-center gap-2">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border border-white shadow-sm object-cover" />
                <span className="text-[12px] font-bold text-slate-500">Sarah</span>
             </div>
             <div className="bg-[#0f172a] p-4 md:p-5 rounded-2xl rounded-tr-sm shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-800 max-w-[200px] md:max-w-[240px]">
                <p className="text-[13px] md:text-[14px] text-white font-medium leading-relaxed">
                   What's our current revenue growth trend for Q3?
                </p>
             </div>
          </motion.div>

          {/* Floating Chat 3 (Bottom Right) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute bottom-[20%] right-[2%] md:right-[10%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 right-0 flex flex-row-reverse items-center gap-2">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border border-white shadow-sm object-cover" />
                <span className="text-[12px] font-bold text-slate-500">Sarah</span>
             </div>
             <div className="bg-[#0f172a] p-3 md:p-4 rounded-2xl rounded-tr-sm shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-800 max-w-[180px] md:max-w-[220px]">
                <p className="text-[13px] md:text-[14px] text-white font-medium leading-relaxed">
                   Perfect, generate a report.
                </p>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
