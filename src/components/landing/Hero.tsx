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
            <h1 className="w-full max-w-none whitespace-nowrap text-5xl md:text-[64px] lg:text-[76px] font-bold tracking-tight mb-6 leading-[1.05] text-slate-900">
            Employ your best salesperson 24/7, <br />right on your website.
            </h1>

          <p className="text-lg md:text-[20px] text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Neryn is a chat assistant that is trained on your custom store data, answers shopper queries, recommends the right product, and adds it to cart 
          <br /> <span className="text-blue-600">No browsing. No confusion. No lost sales.</span>
          </p>

          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 px-4 md:px-0 mt-8 mb-6 relative z-10">
            <div className="relative group p-[1px] rounded-[24px] bg-linear-to-b from-white/80 to-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/40 backdrop-blur-xl rounded-[23px] p-6 h-full flex items-center gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-400/20 transition-all duration-500"></div>
                <div className="w-[85px] shrink-0 text-center">
                  <span className="text-4xl md:text-[42px] font-black tracking-tighter bg-linear-to-b from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">3%</span>
                </div>
                <div className="h-12 w-[1px] bg-slate-200/70 shrink-0 shadow-sm relative z-10"></div>
                <p className="text-[13px] md:text-[14px] font-medium text-slate-700 leading-relaxed flex-1 relative z-10">
                  <b>Avg. visitor-to-buyer ratio </b> on an ecommerce store. <br/><span className="text-slate-500">97 out of 100 leave empty-handed.</span>
                </p>
              </div>
            </div>
            
            <div className="relative group p-[1px] rounded-[24px] bg-linear-to-b from-white/80 to-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/40 backdrop-blur-xl rounded-[23px] p-6 h-full flex items-center gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-400/20 transition-all duration-500"></div>
                <div className="w-[85px] shrink-0 text-center">
                  <span className="text-4xl md:text-[42px] font-black tracking-tighter bg-linear-to-b from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">+35%</span>
                </div>
                <div className="h-12 w-[1px] bg-slate-200/70 shrink-0 shadow-sm relative z-10"></div>
                <p className="text-[13px] md:text-[14px] font-medium text-slate-700 leading-relaxed flex-1 relative z-10">
                  <b>Sales lift</b> a great in-store rep delivers. <br/><span className="text-slate-500">Neryn is that rep for your site - online, always on.</span>
                </p>
              </div>
            </div>

            <div className="relative group p-[1px] rounded-[24px] bg-linear-to-b from-white/80 to-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/40 backdrop-blur-xl rounded-[23px] p-6 h-full flex items-center gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-400/20 transition-all duration-500"></div>
                <div className="w-[85px] shrink-0 text-center">
                  <span className="text-4xl md:text-[42px] font-black tracking-tighter bg-linear-to-b from-blue-700 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">10min</span>
                </div>
                <div className="h-12 w-[1px] bg-slate-200/70 shrink-0 shadow-sm relative z-10"></div>
                <p className="text-[13px] md:text-[14px] font-medium text-slate-700 leading-relaxed flex-1 relative z-10">
                  Setup Time. Just 4 clicks. <br/><span className="text-slate-500">No developer. No code. No fuss.</span>
                </p>
              </div>
            </div>
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

          {/* Central Product Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-20 w-[450px] h-[550px]"
          >
            <div className="w-full h-full rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Store</p>
                  <h3 className="text-lg font-bold text-slate-900">ShopBot Widget</h3>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold mb-2">Recommended products</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                    <span className="text-sm font-bold text-slate-700">UltraShield SPF 50</span>
                    <span className="text-sm font-bold text-slate-900">$28</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                    <span className="text-sm font-bold text-slate-700">Hydrate Gel Mist</span>
                    <span className="text-sm font-bold text-slate-900">$19</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-3 py-2">
                    <span className="text-sm font-bold text-slate-700">Aloe Calm Serum</span>
                    <span className="text-sm font-bold text-slate-900">$24</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto rounded-2xl bg-[#0f172a] px-4 py-3">
                <p className="text-sm text-white font-semibold">2 items added to cart from chat</p>
              </div>
            </div>
          </motion.div>

          {/* Floating Chat 2 (Top Left) - Shopper Question */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute top-[10%] left-[2%] md:left-[10%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 -left-4 flex items-center gap-2">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" className="w-8 h-8 rounded-full border border-white shadow-sm object-cover" />
                <span className="text-[12px] font-bold text-slate-500">Shopper</span>
             </div>
             <div className="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl rounded-tl-sm shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/60 max-w-[200px] md:max-w-[240px]">
                <p className="text-[13px] md:text-[14px] text-slate-700 font-medium leading-relaxed">
                   I'm off to Bali next week, what should I grab?
                </p>
             </div>
          </motion.div>

          {/* Floating Chat 1 (Middle Right) - AI Recommendation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute top-[35%] right-[2%] md:right-[10%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 right-0 flex flex-row-reverse items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-white shadow-sm">
                   <Bot size={16} className="text-blue-600" />
                </div>
                <span className="text-[12px] font-bold text-slate-500">Neryn AI</span>
             </div>
             <div className="bg-[#0f172a] p-4 md:p-5 rounded-2xl rounded-tr-sm shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-800 max-w-[220px] md:max-w-[260px]">
                <p className="text-[13px] md:text-[14px] text-white font-medium leading-relaxed mb-3">
                   Sounds amazing! You'll want sun protection — here are our top 3 SPF picks:
                </p>
                <div className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <div className="w-10 h-10 bg-slate-700 rounded-md flex items-center justify-center text-[16px]">💊</div>
                  <div>
                    <div className="text-[13px] font-bold text-white leading-tight">UltraShield SPF 50</div>
                    <div className="text-[12px] text-slate-400 mt-0.5">$28 · ⭐ 4.8</div>
                  </div>
                </div>
             </div>
          </motion.div>

          {/* Floating Chat 3 (Bottom Left) - Add to cart action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="absolute bottom-[20%] left-[2%] md:left-[10%] z-30 pointer-events-auto"
          >
             <div className="absolute -top-7 -left-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-white shadow-sm">
                   <Bot size={16} className="text-blue-600" />
                </div>
                <span className="text-[12px] font-bold text-slate-500">Neryn AI</span>
             </div>
             <div className="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl rounded-tl-sm shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-slate-200/60 max-w-[180px] md:max-w-[220px]">
                <p className="text-[13px] md:text-[14px] text-slate-700 font-medium leading-relaxed">
                   ✅ Added to your cart. Anything else?
                </p>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
