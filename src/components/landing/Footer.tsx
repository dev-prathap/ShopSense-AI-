"use client";
export function Footer() {
  return (
    <footer className="bg-white pt-24 pb-8 border-t border-slate-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-20">
          
          {/* Logo & Description */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-2.5 bg-black rounded-[2px]" />
                  <div className="w-2.5 h-2.5 bg-black/40 rounded-[2px]" />
                </div>
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-2.5 bg-black/40 rounded-[2px]" />
                  <div className="w-2.5 h-2.5 bg-black rounded-[2px]" />
                </div>
              </div>
              <span className="font-extrabold text-[22px] tracking-tight text-slate-900">Neryn</span>
            </div>
            <p className="text-[14px] text-slate-500 font-medium mb-8 max-w-xs leading-relaxed">
              The sales rep, store manager, and support team your store never had to hire.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4">
               {[
                 { platform: 'Twitter', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>, href: '#' },
                 { platform: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>, href: '#' },
                 { platform: 'Facebook', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, href: '#' },
                 { platform: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, href: '#' }
               ].map((social, i) => (
                   <a key={i} href={social.href} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors" aria-label={social.platform}>
                       {social.icon}
                   </a>
               ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Product</h4>
                <ul className="space-y-4 text-[14px]">
                    <li><a href="#how-it-works" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">How It Works</a></li>
                    <li><a href="#pricing" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Pricing</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Neryn Assist</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Neryn Manage</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Neryn Desk</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Company</h4>
                <ul className="space-y-4 text-[14px]">
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">About</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Careers</a></li>
                    <li><a href="/privacy" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Privacy Policy</a></li>
                    <li><a href="/terms" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Terms of Service</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Resources</h4>
                <ul className="space-y-4 text-[14px]">
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Help & Setup Guide</a></li>
                    <li><a href="/blog" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Blog</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Community</a></li>
                    <li><a href="mailto:hello@neryn.pro" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Contact Us</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Connect</h4>
                <ul className="space-y-4 text-[14px]">
                    <li><a href="mailto:hello@neryn.pro" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">hello@neryn.pro</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">Twitter / X</a></li>
                    <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">LinkedIn</a></li>
                </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[13px] text-slate-500 font-medium">
                © 2026 Neryn. All rights reserved.
            </div>
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 text-[13px] font-bold text-slate-900 hover:text-violet-600 transition-colors"
            >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">↑</div>
                Back to Top
            </button>
        </div>

      </div>
    </footer>
  );
}
