"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Sparkles, 
  Mail, 
  Zap, 
  CheckCircle2, 
  RefreshCcw,
  MessageSquare,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function BusinessContextSetup({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    brandPersona: "Professional & Helpful",
    brandDescription: "",
    supportEmail: "",
    aiTone: "concise_sales",
    aiHandoffSensitivity: 50
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/onboarding/business?storeId=${storeId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            businessName: data.businessName || "",
            brandPersona: data.brandPersona || "Professional & Helpful",
            brandDescription: data.brandDescription || "",
            supportEmail: data.supportEmail || "",
            aiTone: data.aiTone || "concise_sales",
            aiHandoffSensitivity: data.aiHandoffSensitivity || 50
          });
        }
      } catch (e) {
        console.error("Failed to fetch business settings", e);
      }
    }
    fetchSettings();
  }, [storeId]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSaved(false);
    
    try {
      const res = await fetch("/api/onboarding/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, ...formData })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="bg-white border border-slate-200/50 rounded-4xl p-12 shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-accent/20 via-accent to-accent/20" />
        
        <div className="mb-12 flex items-center justify-between">
          <div className="space-y-1">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Context</h2>
             <p className="text-slate-400 text-sm font-medium">Define your brand identity and AI behavior</p>
          </div>
          {saved && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95">
               <CheckCircle2 className="h-4 w-4 mr-2" /> All changes saved
            </Badge>
          )}
        </div>

        <div className="space-y-16">
          {/* Identity Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-slate-400" />
               </div>
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Brand Identity</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Business Name</label>
                  <Input 
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="e.g. My Awesome Store"
                    className="h-12 rounded-2xl border-2 border-slate-50 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-base font-medium"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Support Email</label>
                  <Input 
                    value={formData.supportEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="help@store.com"
                    className="h-12 rounded-2xl border-2 border-slate-50 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-base font-medium"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Brand Description</label>
               <Textarea 
                 value={formData.brandDescription}
                 onChange={(e) => setFormData(prev => ({ ...prev, brandDescription: e.target.value }))}
                 placeholder="Briefly describe what your business sells and your core mission..."
                 className="min-h-[120px] rounded-3xl border-2 border-slate-50 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-base font-medium p-6 resize-none"
               />
            </div>
          </section>

          {/* AI Persona Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-accent" />
               </div>
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">AI Persona & Tone</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Brand Persona</label>
                  <Input 
                    value={formData.brandPersona}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandPersona: e.target.value }))}
                    placeholder="e.g. Friendly & Enthusiastic Sales Assistant"
                    className="h-12 rounded-2xl border-2 border-slate-50 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-base font-medium"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tone of Voice</label>
                  <select 
                    value={formData.aiTone}
                    onChange={(e) => setFormData(prev => ({ ...prev, aiTone: e.target.value }))}
                    className="w-full h-12 rounded-2xl border-2 border-slate-50 focus:border-accent/30 focus:ring-4 focus:ring-accent/5 transition-all text-base font-medium px-4 appearance-none outline-none bg-white"
                  >
                    <option value="concise_sales">Concise & Sales-Oriented</option>
                    <option value="friendly_casual">Friendly & Casual</option>
                    <option value="professional_formal">Professional & Formal</option>
                    <option value="enthusiastic">Enthusiastic & High-Energy</option>
                  </select>
               </div>
            </div>
          </section>

          {/* Handoff Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
               </div>
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Customer Handoff</h3>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Support Handoff Sensitivity</p>
                    <p className="text-xs text-slate-500">How quickly should the AI suggest talking to a human?</p>
                 </div>
                 <span className="text-sm font-black text-accent">{formData.aiHandoffSensitivity}%</span>
              </div>
              <Input 
                type="range"
                min="0"
                max="100"
                step="10"
                value={formData.aiHandoffSensitivity}
                onChange={(e) => setFormData(prev => ({ ...prev, aiHandoffSensitivity: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                 <span>Autonomous</span>
                 <span>Balanced</span>
                 <span>Human-Focused</span>
              </div>
            </div>
          </section>
          {/* AI Preview Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-widest text-emerald-500/80">Live AI Preview</h3>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/20 border-2 border-dashed border-emerald-100 dark:border-emerald-900/20 relative group">
               <div className="absolute -top-3 left-6 px-3 bg-white text-[10px] font-black uppercase text-emerald-500 tracking-widest border border-emerald-100 rounded-full">
                  Persona Output
               </div>
               
               <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-3">
                     <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{formData.businessName ? `Hi! I'm your assistant at ${formData.businessName}. ` : "Hi! "} 
                        {formData.brandPersona ? `I'm here as a ${formData.brandPersona} to help you with anything you need. ` : "How can I help you today? "}
                        {formData.brandDescription ? `We specialize in ${formData.brandDescription.slice(0, 100)}...` : ""}"
                     </p>
                     <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black border-emerald-200 text-emerald-600 bg-white">
                           TONE: {formData.aiTone.replace('_', ' ').toUpperCase()}
                        </Badge>
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </div>

        {error && (
          <div className="mt-8 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2 animate-in shake">
            <ShieldAlert className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 italic">
             This context is combined with your Knowledge Base to train the AI.
          </p>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="h-14 px-12 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-accent hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
          >
            {loading ? (
              <RefreshCcw className="h-5 w-5 animate-spin mr-3" />
            ) : (
              <Zap className="h-5 w-5 mr-3 fill-current" />
            )}
            {saved ? "Branding Synchronized" : "Save Business Context"}
          </Button>
        </div>
      </div>
    </div>
  );
}
