"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the Neryn AI integrate with our existing systems?",
      a: "Our platform offers out-of-the-box connectors for major CRMs, ERPs, and databases, along with a robust REST API and GraphQL endpoints for custom system integration."
    },
    { 
      q: "Is our proprietary data used to train public models?", 
      a: "Never. Your data remains strictly within your dedicated tenant. We guarantee zero data retention for public model training and offer strict data isolation protocols." 
    },
    { 
      q: "What compliance standards do you meet?", 
      a: "We are SOC2 Type II certified, GDPR and CCPA compliant, and offer HIPAA compliant environments for healthcare customers. All data is encrypted at rest and in transit." 
    },
    { 
      q: "Can we deploy the AI models in our own cloud environment?", 
      a: "Yes. Our Enterprise plan includes options for Virtual Private Cloud (VPC) deployment or even on-premise installation for organizations with strict data residency requirements." 
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
      
      {/* Left Column */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="md:w-5/12"
      >
        <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 mb-6 leading-[1.15]">
          Frequently<br/>asked questions.
        </h2>
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-sm">
          Everything you need to know about our enterprise security, deployment options, and AI capabilities. Can't find what you need? Reach out to our solutions team.
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
                    className={`flex-shrink-0 ml-4 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`}
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
