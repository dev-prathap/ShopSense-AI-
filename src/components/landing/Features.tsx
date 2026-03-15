"use client";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mic, Shield, Sparkles } from "lucide-react";

export function Features() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  } as const;

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto space-y-40">
      
      {/* Section 1 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-slate-900 mb-8 max-w-4xl leading-tight">
          Automate operations across your enterprise
        </h2>
        <p className="text-xl text-slate-500 font-medium text-center max-w-3xl mb-12 leading-relaxed">
          Deploy intelligent AI agents that connect with your internal systems, databases, and APIs to handle complex tasks securely and efficiently.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-20">
          {["Automated internal workflows", "Data-driven insights", "Secure knowledge retrieval"].map((point, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-slate-700 text-[15px]">{point}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]">
          {/* Card 1: Happy Customer */}
          <motion.div whileHover={{ y: -8 }} className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-8 flex flex-col items-center justify-end relative h-[400px] overflow-hidden group shadow-sm transition-shadow hover:shadow-xl cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya2VyfGVufDF8fHx8MTc3MzQ0MDUwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Tech worker" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative z-10 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/50 shadow-xl flex items-center gap-4 w-[95%] mb-2">
              <div className="flex -space-x-2 shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[15px] leading-tight">+45% <span className="text-green-500">↑</span></div>
                <div className="text-[12px] font-semibold text-slate-500 mt-0.5">Team Efficiency</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 2: Waveform */}
          <motion.div whileHover={{ y: -8 }} className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100/50 rounded-[32px] p-10 flex items-center justify-center relative h-[400px] shadow-sm transition-shadow hover:shadow-xl cursor-pointer">
            <div className="absolute top-8 right-8 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-full text-[13px] font-bold text-blue-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Sync
            </div>
            <div className="flex items-center justify-center gap-3 h-40 w-full">
              {[20, 50, 30, 80, 40, 100, 60, 40, 90, 30].map((h, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [`${h}%`, `${Math.max(20, h - 30)}%`, `${h}%`] }} 
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                  className={`w-4 rounded-full ${i === 4 || i === 5 ? 'bg-blue-600' : 'bg-blue-200'}`} 
                />
              ))}
            </div>
          </motion.div>

          {/* Card 3: Metrics */}
          <motion.div whileHover={{ y: -8 }} className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-8 flex flex-col justify-center gap-4 relative h-[400px] shadow-sm transition-shadow hover:shadow-xl">
            {[
              { label: "API Calls", val: "↑", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-100" },
              { label: "Data Security", val: "✓", icon: Lock, color: "text-slate-700", bg: "bg-slate-200" },
              { label: "Voice access", val: "↑", icon: Mic, color: "text-pink-500", bg: "bg-pink-100" },
              { label: "API to web", val: "✓", icon: Shield, color: "text-green-500", bg: "bg-green-100" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
              >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                        <item.icon size={18} />
                    </div>
                    <span className="text-[14px] font-bold text-slate-700">{item.label}</span>
                 </div>
                 <span className={`text-[16px] font-extrabold pr-2 ${item.val === '↑' ? 'text-green-500' : 'text-slate-300'}`}>{item.val}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Section 2 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="flex flex-col items-center">
         <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-slate-900 mb-8 max-w-4xl leading-tight">
          Secure, compliant, and scalable AI
        </h2>
        <p className="text-xl text-slate-500 font-medium text-center max-w-3xl mb-20 leading-relaxed">
          Built from the ground up for enterprise requirements. Maintain complete control over your data while leveraging state-of-the-art language models.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1100px]">
          {/* Proactive Messaging */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-50 rounded-[32px] p-10 md:p-12 border border-slate-200/60 h-[520px] flex flex-col relative overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
            <p className="text-[15px] text-slate-500 font-medium mb-8">Role-based access control, SSO integration, and comprehensive audit logs for all AI interactions.</p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {["SOC2 Type II", "GDPR Compliant", "Private VPCs"].map((tag, i) => (
                <span key={i} className="px-4 py-1.5 bg-white rounded-full text-[13px] font-bold text-slate-600 border border-slate-200 shadow-sm">{tag}</span>
              ))}
            </div>
                <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-start gap-4 w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100"><Sparkles size={18} /></div>
                    <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm text-[14px] text-slate-600 font-medium border border-slate-200/60">Accessing internal database...</div>
                </motion.div>
                <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-end gap-4 w-[85%] ml-auto">
                    <div className="bg-[#0f172a] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-[14px] font-medium">Generate Q3 variance report.</div>
                     <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200">
                         <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" className="w-full h-full object-cover" />
                    </div>
                </motion.div>
                <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-start gap-4 w-[90%]">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100"><Sparkles size={18} /></div>
                    <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm text-[14px] text-slate-600 font-medium border border-slate-200/60">Report generated. Variance is +4.2%.</div>
                </motion.div>
          </motion.div>

          {/* Live Voice */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-[32px] p-10 md:p-12 border border-slate-200/60 h-[520px] flex flex-col justify-between overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="w-full flex-1 flex flex-col items-center justify-center relative mb-8">
                <div className="w-full flex justify-center gap-3 mb-10">
                  {["Real-time Sync", "Data Connectors", "API Ready"].map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-slate-50 rounded-full text-[13px] font-bold text-slate-700 border border-slate-200 shadow-sm">{tag}</span>
                  ))}
                </div>
                <div className="relative w-full flex items-center justify-center">
                  <motion.div animate={{ rotate: [3, 5, 3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute inset-0 bg-blue-50/80 rounded-2xl transform scale-105 border border-blue-100/50"></motion.div>
                  <motion.div animate={{ rotate: [-3, -1, -3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-[85%] h-40 bg-white shadow-xl border border-slate-200/60 rounded-2xl p-8 flex items-center gap-5 relative z-10">
                       <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                           <Mic size={24} className="text-blue-500" />
                       </div>
                       <div className="flex-1 flex items-center h-12 gap-2 opacity-60">
                          {[40, 70, 30, 90, 60, 40, 80, 50, 30].map((h, i) => (
                              <div key={i} className="flex-1 bg-blue-400 rounded-full" style={{ height: `${h}%` }}></div>
                          ))}
                       </div>
                       <div className="w-3 h-14 bg-slate-800 rounded-full shadow-sm"></div>
                  </motion.div>
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Data Integration</h3>
                <p className="text-[15px] text-slate-500 font-medium">Connect seamlessly with your existing data warehouses and CRMs for real-time insights.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section 3 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="w-full max-w-[1200px] mx-auto bg-slate-50 rounded-[32px] p-10 md:p-16 border border-slate-200/60 flex flex-col md:flex-row items-center gap-16 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
        <div className="md:w-5/12 text-left pl-4">
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-slate-900 mb-6 leading-[1.15]">
                Enterprise Analytics
            </h2>
            <p className="text-[16px] text-slate-600 font-medium mb-8 leading-relaxed pr-8">
                Gain deep visibility into AI performance and system usage with comprehensive, real-time dashboards.
            </p>
            <div className="space-y-4 mb-10">
              {["Custom report generation", "Real-time metrics", "Exportable data formats"].map((point, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Shield size={12} />
                  </div>
                  <span className="font-bold text-slate-700 text-[14px]">{point}</span>
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 bg-[#0f172a] hover:bg-black text-white px-8 py-4 rounded-full text-[15px] font-bold transition-all shadow-xl group">
                Explore Analytics
                <span className="bg-white/10 text-white p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <ArrowRight size={14} className="-rotate-45" strokeWidth={3} />
                </span>
            </motion.button>
        </div>

        <motion.div whileHover={{ x: -10, y: -10 }} className="md:w-7/12 w-full bg-white rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-200/60 flex overflow-hidden h-[420px] transform md:translate-x-12 md:translate-y-12 transition-transform duration-500">
             <div className="w-[30%] bg-slate-50 border-r border-slate-200/60 p-6 flex flex-col">
                <div className="space-y-2">
                    {["Overview", "Performance", "Usage logs", "Settings"].map((item, i) => (
                        <div key={item} className={`px-4 py-3 rounded-2xl text-[15px] font-bold cursor-pointer transition-colors ${i === 0 ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:bg-white/50'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="mt-auto border-t border-slate-200/60 pt-6 flex items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop" className="w-10 h-10 rounded-full shadow-sm object-cover border border-slate-200" />
                    <div>
                        <div className="text-[14px] font-bold text-slate-800">Sarah Chen</div>
                        <div className="text-[12px] font-medium text-slate-400">Data Analyst</div>
                    </div>
                </div>
             </div>

             <div className="flex-1 p-8">
                 <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-bold text-slate-800">System Performance</h3>
                     <button className="text-[13px] bg-white border border-slate-200/60 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">Export Data</button>
                 </div>
                 
                 <div className="space-y-4">
                     {[
                         { name: "Query Latency", role: "120ms avg", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop", status: "Optimal" },
                         { name: "API Usage", role: "8.4M calls", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop", status: "Active" },
                         { name: "Model Accuracy", role: "99.4%", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop", status: "Verifying" }
                     ].map((user, i) => (
                         <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 rounded-2xl px-3 -mx-3 transition-colors cursor-pointer">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><Sparkles size={18} /></div>
                                <div>
                                    <div className="text-[15px] font-bold text-slate-800">{user.name}</div>
                                    <div className="text-[13px] text-slate-400 font-medium">{user.role}</div>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                 <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'Verifying' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                 <span className="text-[13px] font-bold text-slate-500 min-w-[50px]">{user.status}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </motion.div>
      </motion.div>

    </section>
  );
}
