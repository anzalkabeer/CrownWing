"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 w-full pt-24 pb-32 md:pb-12 border-t border-amber-500/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto px-12 border-b border-amber-500/5 pb-16">
        {/* Col 1: Brand */}
        <div className="flex flex-col gap-stack-sm">
          <Link href="/" className="flex items-center gap-2 text-xl font-serif tracking-[0.2em] text-amber-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
            <span className="font-h3 text-h3 text-primary">CROWNWING</span>
          </Link>
          <p className="font-body-md text-slate-400 leading-relaxed font-light mt-4">
            Elevating heritage through meticulous craftsmanship and uncompromising luxury.
          </p>
        </div>
        
        {/* Col 2: Explore */}
        <div className="flex flex-col gap-stack-sm">
          <h4 className="text-[11px] uppercase tracking-widest text-amber-500/80 mb-4">EXPLORE</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">The Collection</Link>
            <Link href="#" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">Bespoke Service</Link>
            <Link href="#" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">Private Gallery</Link>
            <Link href="#" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">Sustainability</Link>
          </nav>
        </div>
        
        {/* Col 3: Get in Touch */}
        <div className="flex flex-col gap-stack-sm">
          <h4 className="text-[11px] uppercase tracking-widest text-amber-500/80 mb-4">GET IN TOUCH</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/contact" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">Showroom Locations</Link>
            <Link href="/contact" className="font-body-md leading-relaxed font-light text-slate-500 hover:text-amber-400 hover:translate-x-1 transition-transform duration-300">Inquire</Link>
          </nav>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© 2024 CROWNWING LUXURY HERITAGE. ALL RIGHTS RESERVED.</p>
        <p className="text-slate-500 text-sm italic">Crafted with care</p>
      </div>
    </footer>
  );
}
