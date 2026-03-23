"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Neryn actually know what to recommend?",
      a: "When you install Neryn, it pulls your live product catalog — every product name, description, price, variant, and stock status. When a shopper types something, Neryn reads the intent behind it, not just the keywords, and matches it against your catalog in real time. So \"I have oily skin and hate heavy creams\" maps to the right product, not a generic search result. It only ever recommends products that exist in your store and are currently in stock."
    },
    {
      q: "Will it clash with my existing theme or slow my site down?",
      a: "No. Neryn is a lightweight chat widget that sits in the corner of your storefront. It does not touch your theme files, modify your layout, or add any render-blocking code. Installation is a single script tag or app store click depending on your platform. Most stores are live in under 10 minutes."
    },
    {
      q: "What happens if a shopper asks about something I don't sell?",
      a: "Neryn stays in its lane. If a question has no match in your catalog, it tells the shopper honestly and steers the conversation back to what you do carry. It will not make things up, recommend competitor products, or go off on unrelated tangents. That guardrail is built in by default."
    },
    {
      q: "How does the brand tone setting work?",
      a: "During setup you give Neryn a short description of how your brand speaks — formal, playful, minimal, warm, clinical, whatever fits. It uses that as the baseline for every response. You can also give it example phrases you use and phrases you never want it to say."
    },
    {
      q: "My catalog updates daily with new products and price changes. Will Neryn keep up?",
      a: "Yes. Neryn re-syncs your catalog at the start of every new chat session. Price changes, new arrivals, and sold-out variants are all reflected automatically. You do not need to do anything manually when your catalog changes."
    },
    {
      q: "Is any of my shoppers' data stored or used to train AI models?",
      a: "No shopper conversation data is used to train any public model. Chat sessions are processed in real time and are not retained or sold. Neryn is GDPR compliant and does not require shoppers to create accounts or share personal information to use the chat."
    },
    {
      q: "Can one store run all three products together?",
      a: "Yes, and most stores eventually do. Assist handles the front-end selling. Manage gives you the operational view. Desk takes care of post-purchase support. They share the same catalog connection so there is no duplicate setup."
    },
    {
      q: "Do you take on custom AI automation projects?",
      a: "Yes. If your store has a workflow that needs something beyond what the core products offer — a custom integration, a bespoke AI layer, or specific automation — we build those too. Get in touch at hello@neryn.pro to discuss your project."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
      
      {/* Left Column */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="md:w-5/12"
      >
        <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 mb-6 leading-[1.15]">
          Everything you<br/>need to know.
        </h2>
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-sm">
          Everything you need to know about setup, catalog sync, and custom builds. Need something else? Reach out at <a href="mailto:hello@neryn.pro" className="text-blue-600 hover:underline">hello@neryn.pro</a>
        </p>
      </motion.div>

      {/* Right Column - Accordion */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="md:w-7/12"
      >
        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ backgroundColor: isOpen ? "rgb(248 250 252)" : "rgb(255 255 255)" }}
                className={`border border-slate-200/60 rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'shadow-sm' : ''}`}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className={`font-semibold text-[15px] transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-700 hover:text-slate-900'}`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 ml-4 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-[14px] text-slate-500 font-medium leading-relaxed pr-8">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </section>
  );
}
