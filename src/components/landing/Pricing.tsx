"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "ShopBot AI",
      tag: "Sales Bot",
      desc: "LLM-powered product discovery and cart assistant embedded on your storefront.",
      price: "$100",
      period: "/month",
      features: ["Live product catalog sync", "Intent-based recommendations", "In-chat cart add", "Brand tone customisation", "Shopify/WooCommerce/BigCommerce"],
      highlight: true
    },
    {
      name: "SearchSync",
      tag: "Visibility",
      desc: "Get found on Google and inside AI search engines like ChatGPT & Perplexity.",
      price: "Custom",
      period: "",
      features: ["Technical SEO & Product Schema", "AI search optimisation (GEO/AEO)", "Brand citation strategy", "Monthly visibility reporting", "Sitemap injection"],
      highlight: false
    },
    {
      name: "SupportDesk AI",
      tag: "Support",
      desc: "AI support bot that resolves tickets, logs issues, and escalates to helpdesk.",
      price: "Custom",
      period: "",
      features: ["Integration with Zendesk/Gorgias", "Auto-resolves returns & FAQs", "Smart human escalation", "CSAT tracking dashboard", "Order status automation"],
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-slate-900 mb-12 max-w-2xl leading-tight"
      >
        Predictable pricing for enterprise teams
      </motion.h2>

      {/* Animated Toggle */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-slate-100/80 p-1.5 rounded-full flex items-center mb-20 relative backdrop-blur-sm border border-slate-200/50">
        {['Monthly', 'Annual'].map((tab) => {
          const isActive = tab === 'Annual' ? isAnnual : !isAnnual;
          return (
            <button
              key={tab}
              onClick={() => setIsAnnual(tab === 'Annual')}
              className={`relative z-10 px-8 py-3 rounded-full text-[15px] font-bold transition-colors flex items-center gap-2 outline-none ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="pricing-active-tab"
                  className="absolute inset-0 bg-[#0f172a] rounded-full shadow-md"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
              {tab === 'Annual' && (
                <span className={`relative z-10 text-[11px] px-2 py-0.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                  -20%
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl perspective-1000">
        {plans.map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: plan.highlight ? -20 : -10, scale: 1.02 }}
            className={`rounded-[32px] p-10 flex flex-col transition-all duration-300 cursor-pointer ${
              plan.highlight 
                ? 'bg-blue-50/50 border-2 border-blue-500 shadow-[0_20px_40px_rgba(37,99,235,0.1)] relative transform lg:-translate-y-6' 
                : 'bg-white border border-slate-200/60 shadow-sm hover:shadow-xl'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-md">
                Enterprise Choice
              </div>
            )}
            
            {plan.tag && (
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 block">{plan.tag}</span>
            )}
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
            <p className="text-[14px] text-slate-500 font-medium mb-10 h-10 leading-relaxed pr-4">
              {plan.desc}
            </p>
            
            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-[44px] font-extrabold text-slate-900 tracking-tight">{plan.price}</span>
              <span className="text-[15px] font-semibold text-slate-400">{plan.period}</span>
            </div>

            <a 
              href={plan.price === 'Custom' ? "mailto:hello@yourdomain.com" : "/signup"}
              className={`group w-full flex items-center justify-center gap-3 py-4 rounded-full text-[15px] font-bold transition-all mb-10 ${
              plan.highlight 
                ? 'bg-[#0f172a] text-white hover:bg-black shadow-lg hover:shadow-xl' 
                : 'bg-slate-50 border border-slate-200/60 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}>
              {plan.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
              <span className={`p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${plan.highlight ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'}`}>
                  <ArrowRight size={14} className="-rotate-45" strokeWidth={3} />
              </span>
            </a>

            <div className="space-y-5 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className={`shrink-0 ${plan.highlight ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-[15px] font-medium text-slate-700 leading-tight pt-0.5">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
