"use client";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      
      {/* Company Logo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="flex items-center gap-2 mb-16 text-slate-800 font-bold text-3xl"
      >
        <Sparkles className="text-yellow-400" fill="currentColor" size={32} />
        Acme Corp
      </motion.div>

      {/* Quote */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="relative w-full px-12 md:px-32 mb-20 max-w-6xl mx-auto"
      >
        {/* Navigation Arrows */}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xl shadow-blue-500/20">
           <ChevronLeft size={28} strokeWidth={2.5} />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xl shadow-blue-500/20">
           <ChevronRight size={28} strokeWidth={2.5} />
        </motion.button>

        <h3 className="text-4xl md:text-5xl lg:text-[48px] font-bold text-slate-900 leading-[1.25] tracking-tight max-w-4xl mx-auto">
          "The Neryn AI implementation reduced our internal data retrieval time by 80%. Our analysts are finally focused on strategy rather than data hunting."
        </h3>
      </motion.div>

      {/* Author */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        className="flex items-center gap-4 mb-40"
      >
        <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200&h=200&fit=crop" 
            alt="Author" 
            className="w-16 h-16 rounded-full object-cover shadow-md border-4 border-white"
        />
        <div className="text-left">
            <div className="font-bold text-slate-900 text-[18px]">Elena Rodriguez</div>
            <div className="text-[14px] font-semibold text-slate-500">VP of Operations, GlobalTech</div>
        </div>
      </motion.div>

      {/* Partner Logos */}
      <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-3 font-bold text-2xl text-slate-800 cursor-pointer">
            <div className="w-10 h-10 border-[3px] border-slate-800 rounded-lg flex items-center justify-center text-lg">L</div>
            LogoIpsum
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-3 font-bold text-2xl text-slate-800 cursor-pointer">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white text-lg">L</div>
            LogoIpsum
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-3 font-bold text-2xl text-slate-800 cursor-pointer">
            <div className="w-10 h-10 border-t-[3px] border-b-[3px] border-slate-800 flex items-center justify-center text-lg">L</div>
            LogoIpsum
        </motion.div>
      </div>

    </section>
  );
}
