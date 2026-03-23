"use client";
import { motion } from "motion/react";

export function Testimonials() {
  return (
    <section id="results" className="py-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
      
      {/* Quote */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="relative w-full px-12 md:px-32 mb-20 max-w-6xl mx-auto"
      >
        <h3 className="text-4xl md:text-5xl lg:text-[48px] font-bold text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
          "I sell skincare and my customers always had questions before buying. Neryn now handles those pre-purchase questions, recommends the right products, and gets more shoppers into checkout."
        </h3>
      </motion.div>

      {/* Author */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        className="flex items-center gap-4 mb-20"
      >
        <img 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop" 
            alt="Author" 
            className="w-16 h-16 rounded-full object-cover shadow-md border-4 border-white"
        />
        <div className="text-left">
            <div className="font-bold text-slate-900 text-[18px]">Founder (Name on request)</div>
            <div className="text-[14px] font-semibold text-slate-500">Shopify skincare brand</div>
        </div>
      </motion.div>

    </section>
  );
}
