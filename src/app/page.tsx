import { redirect } from "next/navigation";
import { readAppSessionFromServerComponent } from "@/lib/auth/session";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Logos } from "@/components/landing/Logos";
import { Features } from "@/components/landing/Features";
import { Integrations } from "@/components/landing/Integrations";
import { Analytics } from "@/components/landing/Analytics";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default async function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-slate-900 overflow-x-hidden">
      <Header />
      <Hero />
      <Logos />
      <Features />
      <Integrations />
      <Analytics />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
