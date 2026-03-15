"use client";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Analytics() {
  const badges = [
    "Conversation analytics",
    "User intent tracking",
    "Performance reports",
    "Actionable insights"
  ];

  const chartData = [30, 45, 25, 60, 40, 75, 50, 85, 90]; 

  return (
    <section id="analytics" className="py-32 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-b from-slate-50 to-white rounded-[48px] p-10 md:p-20 border border-slate-200/60 flex flex-col shadow-sm"
      >
        
        {/* Top Badges */}
        <div className="flex flex-wrap gap-4 mb-20">
          {badges.map((text, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2.5 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200/60 text-[14px] font-semibold text-slate-700 cursor-pointer"
            >
              <CheckCircle2 size={20} className={i === 0 ? "text-blue-500" : "text-slate-400"} />
              {text}
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
          
          {/* Left Text */}
          <div className="lg:w-5/12">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-4xl md:text-[52px] font-bold text-slate-900 mb-8 leading-[1.1]"
            >
              Turn complex data into clear strategic action
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="text-[18px] text-slate-500 font-medium mb-12 leading-relaxed max-w-md"
            >
              Unify your company's knowledge. Give your team instant access to insights, metrics, and automated reports through a simple conversational interface.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 bg-[#0f172a] hover:bg-[#1e293b] text-white px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-xl"
            >
              Request Access
              <span className="bg-white/10 text-white p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight size={14} className="-rotate-45" strokeWidth={3} />
              </span>
            </motion.button>
          </div>

          {/* Right Chart Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            whileHover={{ y: -10 }}
            className="lg:w-7/12 w-full bg-white rounded-[40px] p-10 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-200/60 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="flex items-center gap-2.5 text-slate-500 font-semibold text-[13px] mb-3">
                  <span className="text-green-500 font-bold text-[15px]">↑</span> Revenue growth
                </div>
                <div className="text-[48px] font-extrabold text-slate-900 tracking-tight leading-none">+380%</div>
              </div>
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop" className="w-12 h-12 rounded-full border border-slate-100 shadow-sm" />
            </div>

            {/* Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-4 relative mt-10">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                 {[1,2,3].map(i => <div key={i} className="w-full border-t-[1.5px] border-dashed border-slate-200/60 h-0"></div>)}
              </div>
              
              {chartData.map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center gap-2 z-10 group relative"
                >
                  <motion.div 
                    whileHover={{ scaleY: 1.05 }}
                    className={`w-full rounded-[16px] transition-all duration-300 origin-bottom ${i === chartData.length - 1 ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-100 group-hover:bg-slate-200'}`} 
                    style={{ height: '100%' }}
                  ></motion.div>
                </motion.div>
              ))}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[12px] font-bold text-slate-400 mt-6 uppercase tracking-wider px-3">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
