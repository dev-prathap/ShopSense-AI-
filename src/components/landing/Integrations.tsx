"use client";
import { motion } from "motion/react";
import { ArrowRight, Boxes, Cloud, Code, Cpu, Database, Figma, GitBranch, Github, Globe, Hexagon, Layers, Layout, Maximize, Slack, Trello, Twitter, Triangle, Square, Circle } from "lucide-react";

export function Integrations() {
  const icons1 = [
    { Icon: Figma, bg: "bg-blue-50", color: "text-blue-600" },
    { Icon: Slack, bg: "bg-slate-50", color: "text-slate-600" },
    { Icon: Github, bg: "bg-slate-50", color: "text-slate-700" },
    { Icon: Trello, bg: "bg-blue-50/50", color: "text-blue-500" },
    { Icon: Database, bg: "bg-slate-100", color: "text-slate-800" },
    { Icon: Cloud, bg: "bg-blue-100/50", color: "text-blue-700" },
    { Icon: Layers, bg: "bg-slate-50", color: "text-slate-500" },
    { Icon: Boxes, bg: "bg-blue-50", color: "text-blue-500" },
  ];

  const icons2 = [
    { Icon: Code, bg: "bg-slate-100", color: "text-slate-600" },
    { Icon: Cpu, bg: "bg-blue-50", color: "text-blue-600" },
    { Icon: GitBranch, bg: "bg-slate-50", color: "text-slate-500" },
    { Icon: Globe, bg: "bg-blue-50/50", color: "text-blue-500" },
    { Icon: Hexagon, bg: "bg-slate-50", color: "text-slate-700" },
    { Icon: Layout, bg: "bg-slate-100", color: "text-slate-600" },
    { Icon: Maximize, bg: "bg-blue-50", color: "text-blue-500" },
    { Icon: Database, bg: "bg-slate-50", color: "text-slate-800" },
  ];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight"
        >
          Plugs into the tools you already use.
        </motion.h2>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10">
          Launch quickly with ecommerce-native integrations your team already knows.
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4">
          {["Data Warehouses", "Internal APIs", "Vector Databases", "Identity Providers"].map((tool, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200/60 text-[14px] font-bold text-slate-700 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {tool}
            </div>
          ))}
        </div>
        <p className="text-sm font-bold text-blue-600 mt-6 uppercase tracking-widest">
          Ecommerce-ready. Fast. Reliable.
        </p>
      </div>

      {/* Marquee Rows */}
      <div className="relative w-full max-w-[1400px] mx-auto mb-20 flex flex-col gap-8">
        {/* Edge Fade Gradients */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Row 1 - Moving Left */}
        <div className="flex overflow-hidden">
          <motion.div 
             animate={{ x: ["0%", "-50%"] }} 
             transition={{ duration: 45, ease: "linear", repeat: Infinity }} 
             className="flex gap-8 w-max pr-8"
          >
             {[...icons1, ...icons1, ...icons1].map((item, i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ scale: 1.1, rotate: 5 }} 
                 className={`w-20 h-20 md:w-24 md:h-24 ${item.bg} rounded-[28px] flex items-center justify-center shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-300`}
               >
                   <item.Icon size={36} className={item.color} strokeWidth={1.5} />
               </motion.div>
             ))}
          </motion.div>
        </div>

        {/* Row 2 - Moving Right */}
        <div className="flex overflow-hidden">
          <motion.div 
             animate={{ x: ["-50%", "0%"] }} 
             transition={{ duration: 45, ease: "linear", repeat: Infinity }} 
             className="flex gap-8 w-max pr-8"
          >
             {[...icons2, ...icons2, ...icons2].map((item, i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ scale: 1.1, rotate: -5 }} 
                 className={`w-20 h-20 md:w-24 md:h-24 ${item.bg} rounded-[28px] flex items-center justify-center shadow-sm cursor-pointer hover:shadow-xl transition-shadow duration-300`}
               >
                   <item.Icon size={36} className={item.color} strokeWidth={1.5} />
               </motion.div>
             ))}
          </motion.div>
        </div>
      </div>

      <motion.button 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-3 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-md hover:shadow-lg"
      >
        Explore Integrations
        <span className="bg-[#0f172a] text-white p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowRight size={14} className="-rotate-45" strokeWidth={3} />
        </span>
      </motion.button>
    </section>
  );
}
