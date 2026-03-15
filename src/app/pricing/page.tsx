import { Header } from "@/components/landing/Header";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing - Neryn AI",
  description: "Transparent, predictable pricing for enterprise-grade AI e-commerce tools."
};

export default function PricingPage() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-slate-900 overflow-x-hidden">
      <Header />
      <div className="pt-20">
        <Pricing />
      </div>
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
