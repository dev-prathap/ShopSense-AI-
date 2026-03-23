"use client";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Plus, Mic } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="bg-linear-to-r from-blue-600 via-blue-700 to-[#1e3a8a] rounded-[48px] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl shadow-blue-500/20"
      >
        
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDE1djEwTTE1IDIwaDEwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] bg-repeat"></div>

        {/* Left Content */}
        <div className="md:w-1/2 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-[52px] font-bold text-white mb-6 leading-[1.1]"
          >
            Your store is open right now. Someone is browsing it. Give them a reason to buy.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="text-[18px] text-white/80 font-medium mb-10 max-w-sm leading-relaxed"
          >
            14-day free trial. No credit card. Works in under 10 minutes.
          </motion.p>
          <div className="flex flex-col items-start gap-4">
            <motion.button 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/signup'}
              className="group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-xl"
            >
              Start Free Trial
              <span className="bg-slate-900 text-white p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight size={14} className="-rotate-45" strokeWidth={3} />
              </span>
            </motion.button>
            <motion.p 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] ml-2"
            >
              Shopify · WooCommerce · BigCommerce
            </motion.p>
          </div>
        </div>

        {/* Right Phone Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="md:w-5/12 w-full flex justify-end relative z-10 translate-y-12 md:translate-y-24"
        >
          <div className="w-[320px] h-[600px] bg-white rounded-[48px] shadow-2xl p-3.5 border-8 border-slate-900 flex flex-col group cursor-pointer hover:-translate-y-4 transition-transform duration-500">
            {/* Phone Notch */}
            <div className="w-32 h-7 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-20"></div>
            
            {/* Screen Content */}
            <div className="bg-slate-50 flex-1 rounded-[36px] overflow-hidden flex flex-col relative pt-14 border border-slate-100">
              
              <div className="px-6 flex justify-between items-start mb-8">
                 <div>
                     <h3 className="text-[28px] font-bold text-slate-900 leading-tight">Store Assistant</h3>
                     <p className="text-[13px] text-slate-500 font-medium mt-1">ShopBot is live on your storefront</p>
                 </div>
                 <img 
                    src="https://images.unsplash.com/photo-1755519024827-fd05075a7200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBhdmF0YXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczNDQwMDY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                 />
              </div>

              <div className="px-5 grid grid-cols-2 gap-3 mb-6">
                 <motion.div whileHover={{ scale: 1.02 }} className="bg-blue-50 p-5 rounded-3xl aspect-square flex flex-col justify-between transition-colors border border-blue-100/50 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                         <Sparkles size={16} className="text-blue-600" />
                     </div>
                     <div className="font-bold text-slate-800 text-[15px] leading-tight">Recommend<br/>Products<br/>Live</div>
                 </motion.div>
                 <div className="space-y-3 flex flex-col h-full">
                     <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-3xl flex-1 flex flex-col items-start justify-between border border-slate-200/60 shadow-sm">
                         <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-2">
                            <Plus size={14} className="text-slate-600" />
                         </div>
                         <div className="font-bold text-slate-800 text-[13px] leading-tight">Add to<br/>Cart</div>
                     </motion.div>
                     <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-50 p-5 rounded-3xl flex-1 flex flex-col items-start justify-between border border-slate-200/60 shadow-sm">
                         <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-2">
                            <Plus size={14} className="text-slate-600" />
                         </div>
                         <div className="font-bold text-slate-800 text-[13px] leading-tight">Answer<br/>Questions</div>
                     </motion.div>
                 </div>
              </div>

              {/* Bottom Fake Input */}
              <div className="mt-auto p-5 pb-8 bg-white border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-full flex items-center p-2.5">
                      <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 border border-slate-100">
                          <Plus size={18} />
                      </div>
                      <div className="flex-1 px-3 text-[14px] text-slate-400 font-medium">Ask about products...</div>
                      <div className="w-9 h-9 bg-[#0f172a] rounded-full flex items-center justify-center text-white">
                          <Mic size={16} />
                      </div>
                  </div>
              </div>

            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
