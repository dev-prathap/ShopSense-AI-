"use client";
import { motion } from "motion/react";

export function Logos() {
  const logos = [
    { text: "Company", icon: "C" },
    { text: "Zestia", icon: "Z", outline: true },
    { text: "Triangle", icon: "▲", triangle: true },
    { text: "Parallel", icon: "||", bars: true },
    { text: "Square", icon: "■", square: true },
    { text: "Acme", icon: "A" },
    { text: "Global", icon: "G" },
  ];

  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-20 md:py-24 border-b border-slate-100 overflow-hidden bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
          Trusted by Fortune 500 companies
        </h2>
        <p className="text-lg text-slate-500 font-medium">
          Powering intelligent operations and secure workflows for modern enterprises.
        </p>
      </div>
      
      <div className="relative flex overflow-hidden">
        {/* Gradients */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex items-center gap-16 md:gap-24 w-max pr-16 md:pr-24"
        >
          {duplicatedLogos.map((logo, i) => (
            <div key={i} className="flex items-center gap-2.5 font-bold text-xl text-slate-400 hover:text-slate-800 transition-colors duration-300 cursor-pointer grayscale hover:grayscale-0">
               {logo.triangle ? (
                 <div className="w-0 h-0 border-l-[12px] border-l-transparent border-t-[20px] border-t-current border-r-[12px] border-r-transparent"></div>
               ) : logo.bars ? (
                 <div className="flex gap-1">
                    <div className="w-2.5 h-6 bg-current rounded-sm"></div>
                    <div className="w-2.5 h-6 bg-current opacity-50 rounded-sm"></div>
                 </div>
               ) : logo.square ? (
                 <div className="w-6 h-6 bg-current rotate-45 rounded-sm"></div>
               ) : logo.outline ? (
                 <div className="w-7 h-7 border-[2.5px] border-current rounded-full flex items-center justify-center text-sm">{logo.icon}</div>
               ) : (
                 <div className="w-7 h-7 bg-current rounded-md flex items-center justify-center text-white text-sm">{logo.icon}</div>
               )}
               <span className="tracking-tight">{logo.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
