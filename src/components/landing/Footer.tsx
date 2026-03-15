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
              Convert every visitor into a customer with Neryn's conversion-focused AI assistants.
            </p>
            
            {/* Social Icons (Placeholders) */}
            <div className="flex gap-4">
               {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white cursor-pointer hover:bg-violet-600 transition-colors">
                       <div className="w-3 h-3 bg-white rounded-sm"></div>
                   </div>
               ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Product</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">About</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Features</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Pricing</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">News</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Blog</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Twitter</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Career</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Policy</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Resources</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Help & Guide</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Blog posts</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Community</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Integration</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Company</h4>
                <ul className="space-y-4">
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Privacy policy</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Terms condition</a></li>
                    <li><a href="#" className="text-[14px] text-slate-500 hover:text-slate-900 font-medium transition-colors">Cover page</a></li>
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
